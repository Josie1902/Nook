import uuid
from datetime import datetime, timezone

from app.core.settings import settings
from app.application.exceptions.processing_run import ProcessingError
from app.application.use_cases.book.extract_book_metadata import (
    ExtractBookMetadataUseCase,
)
from app.application.use_cases.book.chunk_book import ChunkBookUseCase
from app.application.use_cases.book.extract_book_text import (
    ExtractBookDocumentUseCase,
)
from app.domain.entities.book import Book, ProcessingStatus
from app.domain.entities.processing_run import (
    ProcessingRun,
    ProcessingRunStage,
    ProcessingRunStatus,
)
from app.domain.repositories.book_repository import BookRepository
from app.domain.repositories.processing_run_repository import (
    ProcessingRunRepository,
)
from app.infrastructure.chunking.docling_chunker import DoclingPdfChunker
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.llm.factory import get_llm_client
from app.infrastructure.llm.stages.metadata_extractor import (
    LLMBookIdentityResolver,
)
from app.infrastructure.metadata_providers.google_books_provider import (
    GoogleBooksMetadataProvider,
)
from app.infrastructure.pdf.docling_text_extractor import DoclingPdfExtractor
from app.infrastructure.pdf.pdf_metadata_extractor import PyPdfMetadataExtractor
from app.infrastructure.pdf.pdf_text_extractor import PyPdfDocumentTextExtractor
from app.infrastructure.repositories.book_repository import (
    SQLAlchemyBookRepository,
)
from app.infrastructure.repositories.chunk_repository import (
    SQLAlchemyChunkRepository,
)
from app.infrastructure.repositories.processing_run_repository import (
    SQLAlchemyProcessingRunRepository,
)
from app.infrastructure.storage.s3_pdf_storage import S3PdfStorage
from app.worker.celery_app import celery_app
from app.infrastructure.chunking.factory import create_tokenizer

def fail_processing(
    run: ProcessingRun,
    book: Book,
    exc: Exception,
    processing_run_repository: ProcessingRunRepository,
    book_repository: BookRepository,
) -> None:
    run.status = ProcessingRunStatus.FAILED
    run.error_message = str(exc)
    run.completed_at = datetime.now(timezone.utc)

    if isinstance(exc, ProcessingError):
        run.error_code = exc.error_code
        run.error_details = exc.details
    else:
        run.error_code = "unexpected_processing_error"
        run.error_details = None

    processing_run_repository.update(run)

    book.processing_status = ProcessingStatus.FAILED
    book.active_processing_run_id = None
    book_repository.update(book)

def _pdf_storage() -> S3PdfStorage:
    return S3PdfStorage(
        endpoint_url=settings.S3_ENDPOINT_URL,
        access_key=settings.S3_ACCESS_KEY,
        secret_key=settings.S3_SECRET_KEY,
        bucket=settings.S3_BUCKET,
        region=settings.S3_REGION,
    )


@celery_app.task(name="EXTRACT_METADATA")
def extract_metadata_task(run_id: uuid.UUID) -> None:
    session = SessionLocal()
    book_repository = SQLAlchemyBookRepository(session)
    processing_run_repository = SQLAlchemyProcessingRunRepository(session)
    book = None
    run = None

    try:
        run = processing_run_repository.get_by_id(run_id)
        if (
            run is None
            or run.status != ProcessingRunStatus.RUNNING
            or run.current_stage != ProcessingRunStage.METADATA
        ):
            raise RuntimeError(
                f"Processing run {run_id} is missing or not ready for metadata extraction"
            )

        book = book_repository.get_by_id(run.book_id)
        if book is None:
            raise RuntimeError(f"Book {run.book_id} not found for run {run_id}")

        metadata_use_case = ExtractBookMetadataUseCase(
            pdf_storage=_pdf_storage(),
            pdf_metadata_extractor=PyPdfMetadataExtractor(),
            document_text_extractor=PyPdfDocumentTextExtractor(),
            book_identity_resolver=LLMBookIdentityResolver(
                get_llm_client(),
                settings.LLM.metadata,
            ),
            metadata_provider=GoogleBooksMetadataProvider(
                api_key=settings.GOOGLE_BOOKS_API_KEY,
            ),
        )

        book_repository.update(metadata_use_case.execute(book))
        run.status = ProcessingRunStatus.VALIDATION_REQUIRED
        processing_run_repository.update(run)
    except Exception as exc:
        if book is not None and run is not None:
            fail_processing(
                run,
                book,
                exc,
                processing_run_repository,
                book_repository,
            )
        raise
    finally:
        session.close()


# Note: Made the decision to merge both extraction
# and chunking as extracted texts are not persisted
@celery_app.task(name="CHUNK_CONTENT")
def chunk_content_task(book_id: uuid.UUID) -> None:
    session = SessionLocal()

    book_repository = SQLAlchemyBookRepository(session)
    processing_run_repository = SQLAlchemyProcessingRunRepository(session)
    chunk_repository = SQLAlchemyChunkRepository(session)

    book = None
    run = None

    try:
        book = book_repository.get_by_id(book_id)

        if book is None or book.active_processing_run_id is None:
            return

        run = processing_run_repository.get_by_id(
            book.active_processing_run_id
        )

        if (
            run is None
            or run.status != ProcessingRunStatus.RUNNING
            or run.current_stage != ProcessingRunStage.CHUNKING
        ):
            return

        document = ExtractBookDocumentUseCase(
            pdf_storage=_pdf_storage(),
            pdf_extractor=DoclingPdfExtractor(),
        ).execute(book)

        chunks = ChunkBookUseCase(
            chunk_repository=chunk_repository,
            chunking_service=DoclingPdfChunker(
                tokenizer=create_tokenizer()
            ),
        ).execute(run.id, document)

        run.metrics.update({
            "pages_total": len(document.pages),
            "chunks_total": len(chunks),
        })

        run.current_stage = ProcessingRunStage.EMBEDDING
        processing_run_repository.update(run)

    except Exception as exc:
        if book is not None and run is not None:
            fail_processing(
                run,
                book,
                exc,
                processing_run_repository,
                book_repository,
            )
        raise

    finally:
        session.close()