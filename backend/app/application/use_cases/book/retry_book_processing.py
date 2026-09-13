import uuid

from app.application.exceptions.book import BookNotFoundError
from app.application.exceptions.processing_run import RetryNotAllowedError
from app.application.tasks.task_publisher import TaskPublisher
from app.domain.entities.book import ProcessingStatus
from app.domain.entities.processing_run import ProcessingRun, ProcessingRunStatus
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.processing_run_repository import ProcessingRunRepository


class RetryBookProcessingUseCase:
    def __init__(
        self,
        book_repository: BookRepository,
        processing_run_repository: ProcessingRunRepository,
        task_publisher: TaskPublisher,
    ):
        self.book_repository = book_repository
        self.processing_run_repository = processing_run_repository
        self.task_publisher = task_publisher

    def execute(self, book_id: uuid.UUID) -> ProcessingRun:
        book = self.book_repository.get_by_id(book_id)
        if book is None:
            raise BookNotFoundError("Book not found")

        run = self.processing_run_repository.get_latest_by_book_id(book.id)
        if run is None:
            raise RetryNotAllowedError("No processing run available to retry")

        if run.status != ProcessingRunStatus.FAILED:
            if run.status in {ProcessingRunStatus.PENDING, ProcessingRunStatus.RUNNING}:
                raise RetryNotAllowedError("Processing is already active")
            raise RetryNotAllowedError("This processing run cannot be retried")

        run.status = ProcessingRunStatus.PENDING
        run.started_at = None
        run.completed_at = None
        run.error_code = None
        run.error_message = None
        run.error_details = None

        book.processing_status = ProcessingStatus.RUNNING
        book.active_processing_run_id = run.id
        self.book_repository.update(book)
        self.processing_run_repository.update(run)

        self.task_publisher.publish_process_book_content(book.id)
        return run
