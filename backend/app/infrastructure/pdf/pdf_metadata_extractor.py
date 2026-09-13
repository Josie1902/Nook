import io

from pypdf import PdfReader

from app.application.metadata_extraction.ports import PdfMetadata, PdfMetadataExtractor


class PyPdfMetadataExtractor(PdfMetadataExtractor):
    def extract(self, content: bytes) -> PdfMetadata:
        reader = PdfReader(io.BytesIO(content))
        info = reader.metadata 
        return PdfMetadata(
            title=(info.title or None) if info else None,
            author=(info.author or None) if info else None,
            isbn=(None),
        )