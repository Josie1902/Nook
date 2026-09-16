import uuid

from app.domain.entities.reading_session_book import SessionBookDetails
from app.domain.repositories.reading_session_book_repository import (
    ReadingSessionBookRepository,
)
from app.domain.repositories.reading_session_repository import (
    ReadingSessionRepository,
)


class ListBooksInSessionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        session_book_repository: ReadingSessionBookRepository,
    ):
        self.session_repository = session_repository
        self.session_book_repository = session_book_repository

    def execute(
        self,
        user_id: str,
        session_id: uuid.UUID,
    ) -> list[SessionBookDetails]:
        session = self.session_repository.get_by_id(session_id)

        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        return self.session_book_repository.list_by_session(session_id)