from app.application.exceptions.processing_run import (
    MetadataExtractionError,
)
from app.application.metadata_extraction.ports import (
    DocumentTextExtractor,
    MetadataProvider,
    PdfMetadataExtractor,
    BookIdentityResolver,
)
from app.application.metadata_extraction.metadata_extractor import MetadataExtractor # placing this here as a temp helper
from app.application.storage.pdf_storage import PdfStorage
from app.domain.entities.book import Book


class ExtractBookMetadataUseCase:
    def __init__(
        self,
        pdf_storage: PdfStorage,
        pdf_metadata_extractor: PdfMetadataExtractor,
        document_text_extractor: DocumentTextExtractor,
        book_identity_resolver: BookIdentityResolver,
        metadata_provider: MetadataProvider,
    ):
        self.pdf_storage = pdf_storage
        self.pdf_metadata_extractor = pdf_metadata_extractor
        self.document_text_extractor = document_text_extractor
        self.book_identity_resolver = book_identity_resolver
        self.metadata_provider = metadata_provider

    def execute(self, book: Book) -> Book:
        try:
            # 1. Load PDF
            content = self.pdf_storage.retrieve(book.storage_key)

            # 2. Extract PDF metadata
            pdf_metadata = self.pdf_metadata_extractor.extract(content)

            # 3. Extract first 5 pages
            first_pages_text = (
                self.document_text_extractor.extract_first_pages_text(
                    content,
                    max_pages=5,
                )
            )

            # 4. Reconcile identity
            identity = self.book_identity_resolver.resolve(
                filename=book.filename,
                pdf_metadata=pdf_metadata,
                first_pages_text=first_pages_text,
            )

            # 5. Search external metadata provider
            if identity.isbn:
                result = self.metadata_provider.search_by_isbn(
                    identity.isbn
                )
            else:
                result = self.metadata_provider.search_by_title_author(
                    title=identity.title,
                    author=identity.author,
                )

            # 6. Apply external metadata
            book.title = result.title or identity.title
            book.author = result.author or identity.author
            book.description = result.description
            book.isbn = result.isbn or identity.isbn
            book.publication_year = result.publication_year
            book.cover_url = result.cover_url
            book.tags = result.tags

            return book

        except Exception as exc:
            raise MetadataExtractionError(
                error_code="metadata_extraction_failed",
                message=str(exc),
                details={"book_id": str(book.id)},
            ) from exc