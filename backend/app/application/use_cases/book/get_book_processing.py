import uuid

from app.application.exceptions.book import BookNotFoundError
from app.application.exceptions.processing_run import ProcessingRunNotFoundError
from app.domain.entities.processing_run import ProcessingRun
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.processing_run_repository import ProcessingRunRepository


class GetBookProcessingUseCase:
    def __init__(
        self,
        book_repository: BookRepository,
        processing_run_repository: ProcessingRunRepository,
    ):
        self.book_repository = book_repository
        self.processing_run_repository = processing_run_repository

    def execute(self, book_id: uuid.UUID) -> ProcessingRun:
        book = self.book_repository.get_by_id(book_id)
        if book is None:
            raise BookNotFoundError("Book not found")

        run = self.processing_run_repository.get_latest_by_book_id(book.id)
        if run is None:
            raise ProcessingRunNotFoundError("Book has no processing run")

        return run
