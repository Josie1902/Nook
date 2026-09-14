import uuid
from dataclasses import asdict, dataclass
from typing import List

from app.application.embedding.ports import EmbeddingProvider
from app.application.generation.ports import (
    AnswerGenerator,
    ContextChunk,
    GeneratedAnswer,
)
from app.application.retrieval.ports import (
    ChunkSearchMatch,
    ChunkSearchRepository,
)
from app.domain.entities.citation import Citation
from app.domain.entities.message import Message, MessageRole
from app.domain.entities.retrieval import Retrieval
from app.domain.entities.retrieval_result import RetrievalResult
from app.domain.repositories.citation_repository import CitationRepository
from app.domain.repositories.message_repository import MessageRepository
from app.domain.repositories.reading_session_book_repository import (
    ReadingSessionBookRepository,
)
from app.domain.repositories.reading_session_repository import (
    ReadingSessionRepository,
)
from app.domain.repositories.retrieval_repository import RetrievalRepository


DEFAULT_TOP_K = 5


class AnswerGenerationError(Exception):
    pass


@dataclass
class AskQuestionResult:
    user_message: Message
    assistant_message: Message
    retrieval: Retrieval
    matches: List[ChunkSearchMatch]
    citations: List[Citation]


class AskQuestionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        session_book_repository: ReadingSessionBookRepository,
        message_repository: MessageRepository,
        retrieval_repository: RetrievalRepository,
        citation_repository: CitationRepository,
        chunk_search_repository: ChunkSearchRepository,
        embedding_provider: EmbeddingProvider,
        answer_generator: AnswerGenerator,
        top_k: int = DEFAULT_TOP_K,
    ):
        self.session_repository = session_repository
        self.session_book_repository = session_book_repository
        self.message_repository = message_repository
        self.retrieval_repository = retrieval_repository
        self.citation_repository = citation_repository
        self.chunk_search_repository = chunk_search_repository
        self.embedding_provider = embedding_provider
        self.answer_generator = answer_generator
        self.top_k = top_k

    def execute(
        self,
        user_id: str,
        session_id: uuid.UUID,
        content: str,
    ) -> AskQuestionResult:
        # Step 1: Make sure the session exists and belongs to the current user.
        session = self.session_repository.get_by_id(session_id)

        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        # Step 2: Get the books that belong to this reading session.
        book_ids = [
            link.book_id
            for link in self.session_book_repository.list_by_session(
                session_id
            )
        ]

        # Step 3: Persist the user's question before doing retrieval or
        # generation so the interaction has a durable message ID.
        user_message = self.message_repository.add(
            Message(
                session_id=session_id,
                sequence_number=self.message_repository.get_next_sequence_number(
                    session_id
                ),
                content={"text": content},
                role=MessageRole.USER,
            )
        )

        # Step 4: Convert the user's question into an embedding.
        query_embedding = self.embedding_provider.embed([content])[0]

        # Step 5: Search only chunks belonging to books in this session.
        matches = self.chunk_search_repository.search(
            book_ids=book_ids,
            query_embedding=query_embedding,
            top_k=self.top_k,
        )

        # Step 6: Persist the retrieval itself.
        retrieval = self.retrieval_repository.add(
            Retrieval(
                message_id=user_message.id,
                query=content,
                metadata={
                    "top_k": self.top_k,
                    "book_ids": [str(book_id) for book_id in book_ids],
                },
            )
        )

        # Step 7: Persist the individual retrieval results so we know
        # which chunks were retrieved and how they ranked.
        if matches:
            self.retrieval_repository.add_results(
                [
                    RetrievalResult(
                        retrieval_id=retrieval.id,
                        chunk_id=match.chunk_id,
                        rank=rank,
                        score=match.score,
                    )
                    for rank, match in enumerate(matches, start=1)
                ]
            )

        # Step 8: Convert retrieval matches into the context format expected
        # by the answer generator.
        context_chunks = [
            ContextChunk(
                chunk_id=match.chunk_id,
                content=match.content,
                book_id=match.book_id,
                book_title=match.book_title,
                book_author=match.book_author,
            )
            for match in matches
        ]

        # Step 9: Ask the LLM to generate the answer using the retrieved
        # chunks as context.
        try:
            generated_answer = self.answer_generator.generate(
                content,
                context_chunks,
            )

        except Exception as exc:
            # The LLM failed. Persist the failed assistant message so the
            # interaction is not lost, then expose an application-level error.
            self.message_repository.add(
                Message(
                    session_id=session_id,
                    sequence_number=self.message_repository.get_next_sequence_number(
                        session_id
                    ),
                    content={},
                    error_message=str(exc),
                    role=MessageRole.ASSISTANT,
                )
            )

            raise AnswerGenerationError(str(exc)) from exc

        # Step 10: Persist the successful assistant answer.
        assistant_message = self.message_repository.add(
            Message(
                session_id=session_id,
                sequence_number=self.message_repository.get_next_sequence_number(
                    session_id
                ),
                content={
                    "segments": [
                        asdict(segment)
                        for segment in generated_answer.segments
                    ]
                },
                role=MessageRole.ASSISTANT,
            )
        )

        # Step 11: Turn the citations selected by the LLM into domain
        # Citation entities. The citation belongs to the assistant message,
        # not the user's question.
        citations = self.citation_repository.add_many(
            self._create_citations(
                assistant_message_id=assistant_message.id,
                generated_answer=generated_answer,
                matches=matches,
            )
        )

        # Step 12: Return everything the application layer need.
        return AskQuestionResult(
            user_message=user_message,
            assistant_message=assistant_message,
            retrieval=retrieval,
            matches=matches,
            citations=citations,
        )

    def _create_citations(
        self,
        assistant_message_id: uuid.UUID,
        generated_answer: GeneratedAnswer,
        matches: List[ChunkSearchMatch],
    ) -> List[Citation]:
        # Build a lookup so we can resolve the chunk referenced by the
        # generated citation without repeatedly scanning the matches.
        matches_by_chunk_id = {
            match.chunk_id: match
            for match in matches
        }

        citations: List[Citation] = []

        # Preserve the order of the generated answer segments.
        # This order is used to display citations consistently.
        for order, segment in enumerate(
            generated_answer.segments,
            start=1,
        ):
            # Some answer segments may not contain a citation.
            if segment.citation is None:
                continue

            # The LLM gives us a chunk_id. Resolve it against the chunks
            # that were actually retrieved for this question.
            match = matches_by_chunk_id.get(
                segment.citation.chunk_id
            )

            # Never allow the LLM to create a citation pointing to a chunk
            # that was not actually retrieved.
            if match is None:
                raise AnswerGenerationError(
                    f"Generated citation references unknown chunk "
                    f"{segment.citation.chunk_id}"
                )

            # Create the immutable citation snapshot.
            #
            # book_title and author are copied from the retrieval match so
            # future changes to Book metadata do not change this citation.
            #
            # book_id and chunk_id preserve the provenance relationship.
            citations.append(
                Citation(
                    message_id=assistant_message_id,
                    book_id=match.book_id,
                    chunk_id=match.chunk_id,
                    book_title=match.book_title,
                    book_author=match.book_author,
                    page_start=match.page_start,
                    page_end=match.page_end,
                    quote=segment.citation.quote,
                    order=order,
                )
            )

        return citations