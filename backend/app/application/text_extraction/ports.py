from typing import Protocol

from docling_core.types.doc.document import DoclingDocument

# TODO: consider making this vendor agnonistic in the future
class PdfExtractor(Protocol):
    def extract(self, content: bytes) -> DoclingDocument:
        ...