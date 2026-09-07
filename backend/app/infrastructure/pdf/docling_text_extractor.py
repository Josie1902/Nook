from io import BytesIO

from docling.datamodel.base_models import DocumentStream
from docling.document_converter import DocumentConverter
from docling_core.types.doc.document import DoclingDocument

# For my MVP, I will be using docling to extract text from PDFs
# due to its ability to handle complex layouts and extract text in a structured manner.
# In the future, I may want to make this portion vendor agnostic

class DoclingPdfExtractor:
    def __init__(self) -> None:
        self._converter = DocumentConverter()

    def extract(self, content: bytes) -> DoclingDocument:
        stream = DocumentStream(
            name="document.pdf",
            stream=BytesIO(content),
        )

        result = self._converter.convert(stream)

        return result.document