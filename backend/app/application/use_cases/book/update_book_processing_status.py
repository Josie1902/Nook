import uuid

from app.domain.entities.book import Book, ProcessingStatus
from app.domain.repositories.book_repository import BookRepository


class UpdateBookProcessingStatusUseCase:
    def __init__(self, book_repository: BookRepository):
        self.book_repository = book_repository

    def execute(
        self,
        book_id: uuid.UUID,
        processing_status: ProcessingStatus,
        active_processing_run_id: uuid.UUID | None = None,
    ) -> Book:
        book = self.book_repository.get_by_id(book_id)

        if book is None:
            raise ValueError("Book not found")

        book.processing_status = processing_status
        book.active_processing_run_id = active_processing_run_id

        return self.book_repository.update(book)