import uuid

from app.domain.entities.reading_session_book import ReadingSessionBook
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.reading_session_book_repository import ReadingSessionBookRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository


class AddBookToSessionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        book_repository: BookRepository,
        session_book_repository: ReadingSessionBookRepository,
    ):
        self.session_repository = session_repository
        self.book_repository = book_repository
        self.session_book_repository = session_book_repository

    def execute(self, user_id: str, session_id: uuid.UUID, book_id: uuid.UUID) -> ReadingSessionBook:
        session = self.session_repository.get_by_id(session_id)
        if session is None or session.user_id != user_id:
            raise ValueError("Session not found")

        book = self.book_repository.get_by_id(book_id)
        if book is None or book.user_id != user_id:
            raise ValueError("Book not found")

        if self.session_book_repository.get_book_in_session(session_id, book_id):
            raise ValueError("Book already in session")

        link = ReadingSessionBook(session_id=session_id, book_id=book_id)
        return self.session_book_repository.add(link)