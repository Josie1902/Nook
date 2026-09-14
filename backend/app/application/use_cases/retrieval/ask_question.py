import uuid
from dataclasses import asdict, dataclass
from typing import List

from app.application.embedding.ports import EmbeddingProvider
from app.application.retrieval.ports import ChunkSearchMatch, ChunkSearchRepository
from app.domain.entities.message import Message, MessageRole
from app.domain.entities.retrieval import Retrieval
from app.domain.entities.retrieval_result import RetrievalResult
from app.domain.repositories.message_repository import MessageRepository
from app.domain.repositories.reading_session_book_repository import ReadingSessionBookRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository
from app.domain.repositories.retrieval_repository import RetrievalRepository
from app.application.generation.ports import AnswerGenerator, ContextChunk

DEFAULT_TOP_K = 5

class AnswerGenerationError(Exception):
    pass

@dataclass
class AskQuestionResult:
    user_message: Message
    assistant_message: Message
    retrieval: Retrieval
    matches: List[ChunkSearchMatch]


class AskQuestionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        session_book_repository: ReadingSessionBookRepository,
        message_repository: MessageRepository,
        retrieval_repository: RetrievalRepository,
        chunk_search_repository: ChunkSearchRepository,
        embedding_provider: EmbeddingProvider,
        answer_generator: AnswerGenerator,
        top_k: int = DEFAULT_TOP_K,
    ):
        self.session_repository = session_repository
        self.session_book_repository = session_book_repository
        self.message_repository = message_repository
        self.retrieval_repository = retrieval_repository
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
        session = self.session_repository.get_by_id(session_id)

        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        book_ids = [
            link.book_id
            for link in self.session_book_repository.list_by_session(session_id)
        ]

        sequence_number = self.message_repository.get_next_sequence_number(session_id)

        user_message  = self.message_repository.add(
            Message(
                session_id=session_id,
                sequence_number=sequence_number,
                content={"text": content},
            )
        )

        query_embedding = self.embedding_provider.embed([content])[0]

        matches = self.chunk_search_repository.search(
            book_ids,
            query_embedding,
            self.top_k,
        )

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

        if matches:
            results = [
                RetrievalResult(
                    retrieval_id=retrieval.id,
                    chunk_id=match.chunk_id,
                    rank=rank,
                    score=match.score,
                )
                for rank, match in enumerate(matches, start=1)
            ]

            self.retrieval_repository.add_results(results)

        context_chunks = [
            ContextChunk(
                chunk_id=m.chunk_id, content=m.content, book_id=m.book_id, book_title=m.book_title, page_end=m.page_end, page_start=m.page_start
            )
            for m in matches
        ]

        try:
            answer_text = self.answer_generator.generate(content, context_chunks)
        except Exception as exc:
            # LLM generation failed: do not persist an assistant message.
            raise AnswerGenerationError(str(exc)) from exc

        assitant_sequence_number = self.message_repository.get_next_sequence_number(session_id)

        assistant_message = self.message_repository.add(
            Message(session_id=session_id, content=asdict(answer_text), role=MessageRole.ASSISTANT, sequence_number=assitant_sequence_number)
        )

        return AskQuestionResult(
            user_message=user_message,
            assistant_message=assistant_message,
            retrieval=retrieval,
            matches=matches,
        )