import uuid

from app.application.use_cases.book.process_book import ProcessBookUseCase
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.processing.placeholder_pdf_processor import PlaceholderPdfProcessor
from app.infrastructure.repositories.book_repository import SQLAlchemyBookRepository
from app.infrastructure.repositories.processing_run_repository import SQLAlchemyProcessingRunRepository
from app.worker.celery_app import celery_app
from app.core.settings import settings

@celery_app.task(name="PROCESS_BOOK")
def process_book_task(book_id: uuid.UUID) -> None:
    session = SessionLocal()
    try:
        use_case = ProcessBookUseCase(
            book_repository=SQLAlchemyBookRepository(session),
            processing_run_repository=SQLAlchemyProcessingRunRepository(session),
            pdf_processor=PlaceholderPdfProcessor(),
        )
        use_case.execute(book_id, settings.PROCESS_CONFIG_VERSION)
    finally:
        session.close()