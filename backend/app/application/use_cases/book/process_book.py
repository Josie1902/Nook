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
from backend.app.application.exceptions.book import (
    BookNotFoundError,
    BookProcessingError,
)
from backend.app.application.exceptions.processing_run import ProcessingError
from backend.app.application.use_cases.book.extract_book_metadata import (
    ExtractBookMetadataUseCase,
)


class ProcessBookUseCase:
    def __init__(
        self,
        book_repository: BookRepository,
        processing_run_repository: ProcessingRunRepository,
        extract_book_metadata_use_case: ExtractBookMetadataUseCase,
    ):
        self.book_repository = book_repository
        self.processing_run_repository = processing_run_repository
        self.extract_book_metadata_use_case = extract_book_metadata_use_case

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
            if active_run and active_run.status == ProcessingRunStatus.VALIDATION_REQUIRED:
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

        try:
            run.status = ProcessingRunStatus.RUNNING
            run.started_at = datetime.now(timezone.utc)
            self.processing_run_repository.update(run)

            book.processing_status = ProcessingStatus.RUNNING
            self.book_repository.update(book)

            # Metadata
            run.current_stage = ProcessingRunStage.METADATA
            self.processing_run_repository.update(run)

            book = self.extract_book_metadata_use_case.execute(book)

            self.book_repository.update(book)

            run.status = ProcessingRunStatus.VALIDATION_REQUIRED
            self.processing_run_repository.update(run)
            return

        except ProcessingError as exc:
            self._fail_processing(run, book, exc)
            return

        except Exception as exc:
            # unexpected error
            self._fail_processing(run, book, exc)
            return

    def _fail_processing(
        self,
        run: ProcessingRun,
        book: Book,
        exc: Exception,
    ) -> None:
        run.status = ProcessingRunStatus.FAILED
        run.error_message = str(exc)
        run.error_code = getattr(
            exc,
            "error_code",
            "UNEXPECTED_PROCESSING_ERROR",
        )
        run.error_details = getattr(exc, "details", None)
        run.completed_at = datetime.now(timezone.utc)

        self.processing_run_repository.update(run)

        book.processing_status = ProcessingStatus.FAILED
        book.active_processing_run_id = None

        self.book_repository.update(book)