from docling_core.types.doc.document import DoclingDocument

from app.application.storage.pdf_storage import PdfStorage
from app.application.text_extraction.ports import PdfExtractor
from app.domain.entities.book import Book
from app.application.exceptions.processing_run import ProcessingError


class ExtractBookDocumentUseCase:
    def __init__(
        self,
        pdf_storage: PdfStorage,
        pdf_extractor: PdfExtractor,
    ) -> None:
        self.pdf_storage = pdf_storage
        self.pdf_extractor = pdf_extractor

    def execute(self, book: Book) -> DoclingDocument:
        content = self.pdf_storage.retrieve(book.storage_key)

        document = self.pdf_extractor.extract(content)

        if not document.texts:
            raise ProcessingError(
                error_code="document_extraction_failed",
                message="No extractable text found in PDF",
                details={"book_id": str(book.id)},
            )

        return document