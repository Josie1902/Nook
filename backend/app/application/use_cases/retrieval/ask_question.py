import uuid
from dataclasses import dataclass
from typing import List

from app.application.embedding.ports import EmbeddingProvider
from app.application.retrieval.ports import ChunkSearchMatch, ChunkSearchRepository
from app.domain.entities.message import Message
from app.domain.entities.retrieval import Retrieval
from app.domain.entities.retrieval_result import RetrievalResult
from app.domain.repositories.message_repository import MessageRepository
from app.domain.repositories.reading_session_book_repository import ReadingSessionBookRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository
from app.domain.repositories.retrieval_repository import RetrievalRepository

DEFAULT_TOP_K = 5


@dataclass
class AskQuestionResult:
    message: Message
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
        top_k: int = DEFAULT_TOP_K,
    ):
        self.session_repository = session_repository
        self.session_book_repository = session_book_repository
        self.message_repository = message_repository
        self.retrieval_repository = retrieval_repository
        self.chunk_search_repository = chunk_search_repository
        self.embedding_provider = embedding_provider
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

        message = self.message_repository.add(
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
                message_id=message.id,
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

        return AskQuestionResult(
            message=message,
            retrieval=retrieval,
            matches=matches,
        )