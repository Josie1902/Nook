import uuid
from dataclasses import dataclass

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
from app.application.use_cases.dtos import (
    CitationBoundingBoxDTO,
    CitationDTO,
    CitationLocationDTO,
)
from app.domain.entities.citation import Citation
from app.domain.entities.message import Message, MessageRole
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.citation_repository import CitationRepository
from app.domain.repositories.message_repository import MessageRepository
from app.domain.repositories.reading_session_book_repository import (
    ReadingSessionBookRepository,
)
from app.domain.repositories.reading_session_repository import (
    ReadingSessionRepository,
)


DEFAULT_TOP_K = 8


class AnswerGenerationError(Exception):
    pass


@dataclass
class AskQuestionResult:
    user_message: Message
    assistant_message: Message
    citations: list[CitationDTO]


class AskQuestionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        session_book_repository: ReadingSessionBookRepository,
        message_repository: MessageRepository,
        citation_repository: CitationRepository,
        chunk_search_repository: ChunkSearchRepository,
        embedding_provider: EmbeddingProvider,
        answer_generator: AnswerGenerator,
        top_k: int = DEFAULT_TOP_K,
    ):
        self.session_repository = session_repository
        self.session_book_repository = session_book_repository
        self.message_repository = message_repository
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
        # 1. Validate session.
        session = self.session_repository.get_by_id(session_id)

        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        # 2. Get books belonging to the session.
        book_ids = [
            link.book_id
            for link in self.session_book_repository.list_by_session(
                session_id
            )
        ]

        # 3. Persist user's question.
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

        # 4. Embed question.
        query_embedding = self.embedding_provider.embed([content])[0]

        # 5. Search chunks.
        matches = self.chunk_search_repository.search(
            book_ids=book_ids,
            query_embedding=query_embedding,
            top_k=self.top_k,
        )

        # 6. Build generation context.
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

        # 7. Generate answer.
        try:
            generated_answer = self.answer_generator.generate(
                content,
                context_chunks,
            )

        except Exception as exc:
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

        # 8. Generate assistant message ID.
        assistant_message_id = uuid.uuid4()

        # 9. Create domain citations.
        citations = self._create_citations(
            assistant_message_id=assistant_message_id,
            generated_answer=generated_answer,
            matches=matches,
        )

        # 10. Build assistant message.
        assistant_message = Message(
            id=assistant_message_id,
            session_id=session_id,
            sequence_number=self.message_repository.get_next_sequence_number(
                session_id
            ),
            content={
                "segments": self._build_segments(
                    generated_answer=generated_answer,
                    citations=citations,
                )
            },
            role=MessageRole.ASSISTANT,
        )

        # 11. Persist assistant message and citations.
        self.message_repository.add(assistant_message)
        self.citation_repository.add_many(citations)

        # 12. Build DTOs for the caller.
        citations_dto = self._build_citation_dtos(
            citations=citations,
            matches=matches,
        )

        return AskQuestionResult(
            user_message=user_message,
            assistant_message=assistant_message,
            citations=citations_dto,
        )

    @staticmethod
    def _create_citations(
        assistant_message_id: uuid.UUID, 
        generated_answer: GeneratedAnswer,
        matches: list[ChunkSearchMatch],
    ) -> list[Citation]:
        matches_by_chunk_id = {
            match.chunk_id: match
            for match in matches
        }

        citations: list[Citation] = []

        for order, segment in enumerate(
            generated_answer.segments,
            start=1,
        ):
            for generated_citation in segment.citations:
                match = matches_by_chunk_id.get(
                    generated_citation.chunk_id
                )

                if match is None:
                    raise AnswerGenerationError(
                        "Generated citation references unknown chunk "
                        f"{generated_citation.chunk_id}"
                    )

                citations.append(
                    Citation(
                        message_id=assistant_message_id,
                        book_id=match.book_id,
                        chunk_id=match.chunk_id,
                        book_title=match.book_title,
                        book_author=match.book_author,
                        quote=generated_citation.quote,
                        page_start=match.page_start,
                        page_end=match.page_end,
                        order=order,
                    )
                )

        return citations

    @staticmethod
    def _build_segments(
        generated_answer: GeneratedAnswer,
        citations: list[Citation],
    ) -> list[dict]:
        citations_by_order = {
            citation.order: citation
            for citation in citations
        }

        return [
            {
                "text": segment.text,
                "citation_ids": (
                    [str(citation.id)]
                    if (citation := citations_by_order.get(order))
                    else []
                ),
            }
            for order, segment in enumerate(
                generated_answer.segments,
                start=1,
            )
        ]

    def _build_citation_dtos(
        self,
        citations: list[Citation],
        matches: list[ChunkSearchMatch],
    ) -> list[CitationDTO]:
        matches_by_chunk_id = {
            match.chunk_id: match
            for match in matches
        }

        result: list[CitationDTO] = []

        for citation in citations:
            match = matches_by_chunk_id.get(citation.chunk_id)

            if match is None:
                continue

            locations = [
                CitationLocationDTO(
                    page=provenance.page_number,
                    bounding_boxes=[
                        CitationBoundingBoxDTO(
                            left=box.left,
                            top=box.top,
                            right=box.right,
                            bottom=box.bottom,
                        )
                        for box in provenance.bounding_boxes
                    ],
                )
                for provenance in match.provenance
            ]

            result.append(
                CitationDTO(
                    id=citation.id,
                    book_id=citation.book_id,
                    book_title=citation.book_title,
                    book_author=citation.book_author,
                    quote=citation.quote,
                    page_start=citation.page_start,
                    page_end=citation.page_end,
                    order=citation.order,
                    locations=locations,
                )
            )

        return result