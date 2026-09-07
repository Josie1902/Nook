import uuid

from app.application.use_cases.book.process_book import ProcessBookUseCase
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.repositories.book_repository import SQLAlchemyBookRepository
from app.infrastructure.repositories.processing_run_repository import SQLAlchemyProcessingRunRepository
from app.worker.celery_app import celery_app
from app.core.settings import settings
from backend.app.application.use_cases.book.extract_book_metadata import ExtractBookMetadataUseCase
from backend.app.infrastructure.llm.factory import get_llm_client
from backend.app.infrastructure.llm.stages.metadata_extractor import LLMBookIdentityResolver
from backend.app.infrastructure.metadata_providers.google_books_provider import GoogleBooksMetadataProvider
from backend.app.infrastructure.pdf.pdf_metadata_extractor import PyPdfMetadataExtractor
from backend.app.infrastructure.pdf.pdf_text_extractor import PyPdfDocumentTextExtractor
from backend.app.infrastructure.storage.s3_pdf_storage import S3PdfStorage

@celery_app.task(name="EXTRACT_METADATA")
def extract_metadata_task(book_id: uuid.UUID) -> None:
    session = SessionLocal()
    try:
        pdf_storage = S3PdfStorage(
            endpoint_url=settings.S3_ENDPOINT_URL,
            access_key=settings.S3_ACCESS_KEY,
            secret_key=settings.S3_SECRET_KEY,
            bucket=settings.S3_BUCKET,
            region=settings.S3_REGION,
        )
        llm_client = get_llm_client()
        extract_book_metadata_use_case = ExtractBookMetadataUseCase(
            pdf_storage=pdf_storage,
            pdf_metadata_extractor=PyPdfMetadataExtractor(),
            document_text_extractor=PyPdfDocumentTextExtractor(),
            book_identity_resolver=LLMBookIdentityResolver(llm_client, settings.LLM.metadata),
            metadata_provider=GoogleBooksMetadataProvider(api_key=settings.GOOGLE_BOOKS_API_KEY),
        )
        use_case = ProcessBookUseCase(
            book_repository=SQLAlchemyBookRepository(session),
            processing_run_repository=SQLAlchemyProcessingRunRepository(session),
            extract_book_metadata_use_case=extract_book_metadata_use_case,
        )
        use_case.execute(book_id, settings.PROCESS_CONFIG_VERSION)
    finally:
        session.close()