import uuid
from datetime import datetime, timezone

from app.application.processing.pdf_processor import PdfProcessor
from app.domain.entities.book import Book, ProcessingStatus
from app.domain.entities.processing_run import ProcessingRun, ProcessingRunStatus
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.processing_run_repository import ProcessingRunRepository


class ProcessBookUseCase:
    def __init__(
        self,
        book_repository: BookRepository,
        processing_run_repository: ProcessingRunRepository,
        pdf_processor: PdfProcessor,
    ):
        self.book_repository = book_repository
        self.processing_run_repository = processing_run_repository
        self.pdf_processor = pdf_processor

    def execute(self, book_id: uuid.UUID, config_version: str) -> None:
        book: Book | None = self.book_repository.get_by_id(book_id)
        if book is None:
            raise ValueError("Book not found")

        if self.processing_run_repository.get_active_by_book(book.id):
            raise ValueError("Book is already being processed")

        # Create the run in PENDING state
        run = self.processing_run_repository.add(
            ProcessingRun(
                book_id=book.id,
                config_version=config_version,
                status=ProcessingRunStatus.PENDING,
            )
        )

        # Book is waiting for processing to start
        book.processing_status = ProcessingStatus.PENDING
        book.active_processing_run_id = run.id
        self.book_repository.update(book)

        try:
            # Processing has now actually started
            run.status = ProcessingRunStatus.RUNNING
            run.started_at = datetime.now(timezone.utc)
            self.processing_run_repository.update(run)

            book.processing_status = ProcessingStatus.RUNNING
            self.book_repository.update(book)

            self.pdf_processor.process(book)

        except Exception as exc:
            run.status = ProcessingRunStatus.FAILED
            run.error_message = str(exc)
            run.completed_at = datetime.now(timezone.utc)
            self.processing_run_repository.update(run)

            book.processing_status = ProcessingStatus.FAILED
            book.active_processing_run_id = None
            self.book_repository.update(book)
            return

        run.status = ProcessingRunStatus.COMPLETED
        run.completed_at = datetime.now(timezone.utc)
        self.processing_run_repository.update(run)

        book.processing_status = ProcessingStatus.COMPLETED
        book.active_processing_run_id = None
        self.book_repository.update(book)
