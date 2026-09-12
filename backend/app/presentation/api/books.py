import uuid

from fastapi import APIRouter, Depends, UploadFile, status, HTTPException

from app.application.use_cases.book.upload_book import UploadBookUseCase
from app.application.use_cases.book.process_book import ProcessBookUseCase
from app.core.settings import settings
from app.domain.entities.processing_run import (
    ProcessingRunStage,
    ProcessingRunStatus,
)
from app.presentation.api.dependencies import (
    get_book_repository,
    get_current_user,
    get_pdf_storage,
    get_processing_run_repository,
    get_task_publisher,
)
from app.presentation.api.schemas.book import (
    BookMetadataResponse,
    BookMetadataUpdate,
    BookResponse,
)
from app.domain.entities.user import User

router = APIRouter(
    prefix="/books",
    tags=["books"],
)


@router.post(
    "",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_book(
    file: UploadFile,
    user: User = Depends(get_current_user),
    book_repository=Depends(get_book_repository),
    processing_run_repository=Depends(get_processing_run_repository),
    pdf_storage=Depends(get_pdf_storage),
    task_publisher=Depends(get_task_publisher),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )
    
    content = await file.read()

    use_case = UploadBookUseCase(
        book_repository,
        pdf_storage,
    )

    book = use_case.execute(
        user.id,
        file.filename,
        content,
    )

    ProcessBookUseCase(
        book_repository=book_repository,
        processing_run_repository=processing_run_repository,
        task_publisher=task_publisher,
    ).execute(book.id, settings.PROCESS_CONFIG_VERSION)

    return BookResponse(
        id=book.id,
        filename=book.filename,
        mime_type=book.mime_type,
        file_size=book.file_size,
        title=book.title,
        author=book.author,
        description=book.description,
        isbn=book.isbn,
        publication_year=book.publication_year,
        cover_url=book.cover_url,
        tags=book.tags,
        processing_status=book.processing_status.value,
        created_at=book.created_at,
        updated_at=book.updated_at,
    )


def _get_book_for_metadata_review(
    book_id: uuid.UUID,
    user: User,
    book_repository,
    processing_run_repository,
):
    book = book_repository.get_by_id(book_id)

    if book is None or book.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    if book.active_processing_run_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Book is not awaiting metadata review",
        )

    run = processing_run_repository.get_by_id(book.active_processing_run_id)
    if (
        run is None
        or run.status != ProcessingRunStatus.VALIDATION_REQUIRED
        or run.current_stage != ProcessingRunStage.METADATA
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Book is not awaiting metadata review",
        )

    return book, run

@router.get(
    "/{book_id}/metadata",
    response_model=BookMetadataResponse,
)
def get_book_metadata_for_review(
    book_id: uuid.UUID,
    user: User = Depends(get_current_user),
    book_repository=Depends(get_book_repository),
    processing_run_repository=Depends(get_processing_run_repository),
):
    book, run = _get_book_for_metadata_review(
        book_id,
        user,
        book_repository,
        processing_run_repository,
    )

    return BookMetadataResponse(
        id=book.id,
        title=book.title,
        author=book.author,
        description=book.description,
        isbn=book.isbn,
        publication_year=book.publication_year,
        cover_url=book.cover_url,
        tags=book.tags,
        processing_status=book.processing_status.value,
        processing_run_status=run.status.value,
    )


@router.patch(
    "/{book_id}/metadata",
    response_model=BookMetadataResponse,
)
def update_book_metadata(
    book_id: uuid.UUID,
    metadata: BookMetadataUpdate,
    user: User = Depends(get_current_user),
    book_repository=Depends(get_book_repository),
    processing_run_repository=Depends(get_processing_run_repository),
    task_publisher=Depends(get_task_publisher),
):
    book, run = _get_book_for_metadata_review(
        book_id,
        user,
        book_repository,
        processing_run_repository,
    )

    for field_name in metadata.model_fields_set:
        setattr(book, field_name, getattr(metadata, field_name))

    run.status = ProcessingRunStatus.RUNNING
    run.current_stage = ProcessingRunStage.CHUNKING

    book_repository.update(book)
    processing_run_repository.update(run)

    task_publisher.publish_chunk_content(book.id)

    return BookMetadataResponse(
        id=book.id,
        title=book.title,
        author=book.author,
        description=book.description,
        isbn=book.isbn,
        publication_year=book.publication_year,
        cover_url=book.cover_url,
        tags=book.tags,
        processing_status=book.processing_status.value,
        processing_run_status=run.status.value,
    )