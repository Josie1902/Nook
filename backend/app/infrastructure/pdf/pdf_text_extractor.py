import io

from pypdf import PdfReader

from app.application.metadata_extraction.ports import DocumentTextExtractor


class PyPdfDocumentTextExtractor(DocumentTextExtractor):
    def extract_first_pages_text(self, content: bytes, max_pages: int = 5) -> str:
        reader = PdfReader(io.BytesIO(content))
        pages = reader.pages[:max_pages]
        return "\n".join(page.extract_text() or "" for page in pages)