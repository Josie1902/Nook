import uuid
from typing import Any

from app.application.generation.ports import (
    BookRecommender,
    BookSummary,
    ResearchGenerator,
)
from app.domain.entities.message import Message, MessageRole
from app.domain.entities.reading_session import ReadingSession, SessionMode
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.message_repository import MessageRepository
from app.domain.repositories.reading_session_book_repository import ReadingSessionBookRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository


class ResearchSessionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        message_repository: MessageRepository | None,
        book_repository: BookRepository,
        session_book_repository: ReadingSessionBookRepository,
        recommender: BookRecommender,
        research_generator: ResearchGenerator,
    ):
        self.session_repository = session_repository
        self.message_repository = message_repository
        self.book_repository = book_repository
        self.session_book_repository = session_book_repository
        self.recommender = recommender
        self.research_generator = research_generator

    def _get_session(self, user_id: str, session_id: uuid.UUID) -> ReadingSession:
        session = self.session_repository.get_by_id(session_id)
        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")
        return session

    def _normalize_book_ids(
        self,
        user_id: str,
        book_ids: list[uuid.UUID] | None,
    ) -> set[uuid.UUID]:
        if not book_ids:
            raise ValueError("Selection cannot be empty")

        normalized: list[uuid.UUID] = []
        seen: set[uuid.UUID] = set()

        for raw in book_ids:
            book_id = uuid.UUID(str(raw))

            if book_id in seen:
                raise ValueError("Duplicate selected books are not allowed")

            seen.add(book_id)
            normalized.append(book_id)

        allowed = {book.id for book in self.book_repository.list_by_user(user_id)}
        invalid = [book_id for book_id in normalized if book_id not in allowed]

        if invalid:
            raise ValueError("Book not found")

        return set(normalized)

    def _recommend_books(
        self,
        user_id: str,
        topic: str,
        description: str,
    ) -> list[dict[str, Any]]:
        user_books = self.book_repository.list_by_user(user_id)

        if not user_books:
            raise ValueError("No books available for recommendation")

        book_summaries = [
            BookSummary(
                book_id=book.id,
                title=book.title or book.filename,
                author=book.author,
                description=book.description,
                tags=book.tags,
            )
            for book in user_books
        ]

        recommendations = self.recommender.recommend(
            topic,
            description,
            book_summaries,
        )

        allowed = {book.id: book for book in user_books}
        result: list[dict[str, Any]] = []
        seen: set[uuid.UUID] = set()

        for recommendation in recommendations:
            book_id = (
                recommendation["book_id"]
                if isinstance(recommendation, dict)
                else recommendation.book_id
            )
            reason = (
                recommendation["reason"]
                if isinstance(recommendation, dict)
                else recommendation.reason
            )

            try:
                normalized = uuid.UUID(str(book_id))
            except (TypeError, ValueError):
                continue

            if normalized not in allowed or normalized in seen:
                continue

            book = allowed[normalized]
            seen.add(normalized)

            result.append(
                {
                    "book_id": str(book.id),
                    "title": book.title or book.filename,
                    "author": book.author,
                    "reason": str(reason),
                    "selected": True,
                }
            )

        if not result:
            raise ValueError("Invalid AI recommendation")

        return result

    def start_research(
        self,
        user_id: str,
        session_id: uuid.UUID,
        request: str,
    ) -> dict[str, Any]:
        session = self._get_session(user_id, session_id)

        if session.mode != SessionMode.RESEARCH:
            raise ValueError("Session is not in research mode")

        cleaned = request.strip()

        if not cleaned:
            raise ValueError("Research request is required")

        if self.message_repository is not None:
            self.message_repository.add(
                Message(
                    session_id=session_id,
                    sequence_number=self.message_repository.get_next_sequence_number(
                        session_id
                    ),
                    content={"text": cleaned},
                    role=MessageRole.USER,
                )
            )

        research = self.research_generator.generate(cleaned)

        books = self._recommend_books(
            user_id,
            research.topic,
            research.description,
        )

        selected_book_ids = [
            uuid.UUID(book["book_id"])
            for book in books
        ]

        return {
            "mode": "research",
            "topic": research.topic,
            "description": research.description,
            "books": books,
            "selected_book_ids": selected_book_ids,
        }

    def refine_research(
        self,
        user_id: str,
        session_id: uuid.UUID,
        topic: str,
        description: str,
        book_ids: list[uuid.UUID] | None = None,
        comments: str | None = None,
    ) -> dict[str, Any]:
        session = self._get_session(user_id, session_id)
    
        if session.mode != SessionMode.RESEARCH:
            raise ValueError("Session is not in research mode")
    
        selected = (
            self._normalize_book_ids(user_id, book_ids)
            if book_ids
            else set()
        )
    
        research = self.research_generator.refine(
            topic,
            description,
            comments.strip() if comments else "",
        )
    
        recommended_books = self._recommend_books(
            user_id,
            research.topic,
            research.description,
        )
    
        if not selected:
            selected = {
                uuid.UUID(book["book_id"])
                for book in recommended_books
            }
    
        books = self._merge_selected_books(
            user_id=user_id,
            recommended_books=recommended_books,
            selected_ids=selected,
        )
    
        return {
            "mode": "research",
            "topic": research.topic,
            "description": research.description,
            "books": books,
            "selected_book_ids": sorted(
                selected,
                key=lambda item: str(item),
            ),
        }
    
    def _merge_selected_books(
        self,
        user_id: str,
        recommended_books: list[dict[str, Any]],
        selected_ids: set[uuid.UUID],
    ) -> list[dict[str, Any]]:
        """
        Return recommendations plus any manually selected books
        that are not currently recommended.
        """
        user_books = {
            book.id: book
            for book in self.book_repository.list_by_user(user_id)
        }

        result = list(recommended_books)
        existing_ids = {
            uuid.UUID(book["book_id"])
            for book in result
        }

        for book_id in selected_ids - existing_ids:
            book = user_books.get(book_id)

            if book is None:
                continue

            result.append(
                {
                    "book_id": str(book.id),
                    "title": book.title or book.filename,
                    "author": book.author,
                    "reason": None,
                    "selected": True,
                }
            )

        for book in result:
            book_id = uuid.UUID(book["book_id"])
            book["selected"] = book_id in selected_ids

        return result