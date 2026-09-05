import uuid

from app.domain.entities.book import Book
from app.domain.repositories.book_repository import BookRepository


class CreateBookUseCase:
    def __init__(self, book_repository: BookRepository):
        self.book_repository = book_repository

    def execute(
        self,
        user_id: str,
        filename: str,
        storage_key: str,
        mime_type: str,
        file_size: int,
        file_hash: str | None = None,
    ) -> Book:
        book = Book(
            user_id=user_id,
            filename=filename,
            storage_key=storage_key,
            mime_type=mime_type,
            file_size=file_size,
            file_hash=file_hash,
        )

        return self.book_repository.add(book)