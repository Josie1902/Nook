from app.application.processing.pdf_processor import PdfProcessor
from app.domain.entities.book import Book

# TODO: Remove
class PlaceholderPdfProcessor(PdfProcessor):
    def process(self, book: Book) -> None:
        pass