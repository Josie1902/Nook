import uuid

from app.domain.repositories.reading_session_book_repository import ReadingSessionBookRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository


class RemoveBookFromSessionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        session_book_repository: ReadingSessionBookRepository,
    ):
        self.session_repository = session_repository
        self.session_book_repository = session_book_repository

    def execute(self, user_id: str, session_id: uuid.UUID, book_id: uuid.UUID) -> None:
        session = self.session_repository.get_by_id(session_id)
        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        link = self.session_book_repository.get_book_in_session(session_id, book_id)
        if link is None:
            raise ValueError("Book not in session")

        self.session_book_repository.delete_book_in_session(session_id, book_id)