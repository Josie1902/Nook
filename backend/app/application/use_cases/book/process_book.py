import uuid
from datetime import datetime, timezone

from app.domain.entities.book import Book, ProcessingStatus
from app.domain.entities.processing_run import (
    ProcessingRun,
    ProcessingRunStatus,
    ProcessingRunStage,
)
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.processing_run_repository import ProcessingRunRepository
from app.application.exceptions.book import (
    BookNotFoundError,
    BookProcessingError,
)


class ProcessBookUseCase:
    def __init__(
        self,
        book_repository: BookRepository,
        processing_run_repository: ProcessingRunRepository,
    ):
        self.book_repository = book_repository
        self.processing_run_repository = processing_run_repository

    def execute(
        self,
        book_id: uuid.UUID,
        config_version: str,
    ) -> None:
        book = self.book_repository.get_by_id(book_id)

        if book is None:
            raise BookNotFoundError("Book not found")

        if book.active_processing_run_id:
            active_run = self.processing_run_repository.get_by_id(
                book.active_processing_run_id
            )

            if (
                active_run
                and active_run.status
                == ProcessingRunStatus.VALIDATION_REQUIRED
            ):
                return

        if self.processing_run_repository.get_active_by_book(book.id):
            raise BookProcessingError(
                "A processing run is already active for this book"
            )

        run = self.processing_run_repository.add(
            ProcessingRun(
                book_id=book.id,
                config_version=config_version,
                status=ProcessingRunStatus.PENDING,
            )
        )

        book.processing_status = ProcessingStatus.PENDING
        book.active_processing_run_id = run.id
        self.book_repository.update(book)

        run.status = ProcessingRunStatus.RUNNING
        run.started_at = datetime.now(timezone.utc)
        self.processing_run_repository.update(run)

        book.processing_status = ProcessingStatus.RUNNING
        self.book_repository.update(book)

        # Metadata
        run.current_stage = ProcessingRunStage.METADATA
        self.processing_run_repository.update(run)
