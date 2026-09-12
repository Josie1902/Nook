from app.application.storage.pdf_storage import PdfStorage
from app.application.storage.storage_key_generator import generate_storage_key
from app.application.utils.file_hash import calculate_file_hash
from app.domain.entities.book import Book
from app.domain.repositories.book_repository import BookRepository
from app.infrastructure.pdf.validator import validate_pdf
from app.application.exceptions.book import DuplicateBookError

class UploadBookUseCase:
    def __init__(
        self,
        book_repository: BookRepository,
        pdf_storage: PdfStorage,
    ):
        self.book_repository = book_repository
        self.pdf_storage = pdf_storage

    def execute(
        self,
        user_id: str,
        filename: str,
        content: bytes,
    ) -> Book:
        # 1. Validate PDF
        validate_pdf(content)

        # 2. Calculate hash
        file_hash = calculate_file_hash(content)

        # 3. Check for duplicate
        existing_book = self.book_repository.find_by_file_hash(
            user_id=user_id,
            file_hash=file_hash,
        )

        if existing_book:
            # Duplicate book found, raise an exception
            # for eventual rejection of the upload request.
            raise DuplicateBookError(
                "This book already exists in your library."
            )

        # 4. Generate storage key
        storage_key = generate_storage_key(
            user_id,
            filename,
        )

        # 5. Store PDF
        self.pdf_storage.upload(
            storage_key,
            content,
        )

        # 6. Create book
        book = Book(
            user_id=user_id,
            filename=filename,
            storage_key=storage_key,
            mime_type="application/pdf",
            file_size=len(content),
            file_hash=file_hash,
        )

        # 7. Persist book
        book = self.book_repository.add(book)

        return book