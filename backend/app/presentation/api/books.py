from fastapi import APIRouter, Depends, UploadFile, status, HTTPException

from app.application.use_cases.book.upload_book import UploadBookUseCase
from app.presentation.api.dependencies import (
    get_book_repository,
    get_pdf_storage,
    get_task_publisher,
)
from app.presentation.api.schemas.book import BookResponse

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
    user_id: str,
    book_repository=Depends(get_book_repository),
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
        task_publisher,
    )

    book = use_case.execute(
        user_id,
        file.filename,
        content,
    )

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