import uuid
from typing import Any

from app.domain.entities.reading_session import ReadingSession, SessionMode
from app.domain.entities.reading_session_book import ReadingSessionBook
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.reading_session_book_repository import (
    ReadingSessionBookRepository,
)
from app.domain.repositories.reading_session_repository import (
    ReadingSessionRepository,
)


class ConfirmResearchSelectionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        book_repository: BookRepository,
        session_book_repository: ReadingSessionBookRepository,
    ):
        self.session_repository = session_repository
        self.book_repository = book_repository
        self.session_book_repository = session_book_repository

    def _get_session(
        self,
        user_id: str,
        session_id: uuid.UUID,
    ) -> ReadingSession:
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

        allowed = {
            book.id
            for book in self.book_repository.list_by_user(user_id)
        }

        invalid = [
            book_id
            for book_id in normalized
            if book_id not in allowed
        ]

        if invalid:
            raise ValueError("Book not found")

        return set(normalized)

    def execute(
        self,
        user_id: str,
        session_id: uuid.UUID,
        book_ids: list[uuid.UUID] | None,
        topic: str,
        description: str,
    ) -> dict[str, Any]:
        session = self._get_session(user_id, session_id)

        if session.mode != SessionMode.RESEARCH:
            raise ValueError("Session is not in research mode")

        selected = self._normalize_book_ids(user_id, book_ids)

        final_topic = topic.strip()
        final_description = description.strip()

        if not final_topic:
            raise ValueError("Research topic is required")

        if not final_description:
            raise ValueError("Research description is required")

        for book_id in selected:
            if self.session_book_repository.get_book_in_session(
                session_id,
                book_id,
            ):
                raise ValueError("Book already in session")

        session.update_topic(final_topic)
        session.update_description(final_description)
        session.chat_mode()

        for book_id in selected:
            self.session_book_repository.add(
                ReadingSessionBook(
                    session_id=session_id,
                    book_id=book_id,
                )
            )

        self.session_repository.update(session)

        return {
            "mode": "chat",
            "topic": final_topic,
            "description": final_description,
            "books": [
                {
                    "book_id": str(book_id),
                    "selected": True,
                }
                for book_id in sorted(
                    selected,
                    key=lambda item: str(item),
                )
            ],
            "selected_book_ids": sorted(
                selected,
                key=lambda item: str(item),
            ),
        }