from abc import ABC, abstractmethod
from typing import List
import uuid

from app.domain.entities.chunk import Chunk, ChunkProvenance
from docling_core.types.doc.document import DoclingDocument

# Consider making this vendor agnostic in the future
class PdfChunker(ABC):
    @abstractmethod
    def chunk(self, processing_run_id: uuid.UUID, doc: DoclingDocument) ->  tuple[List[Chunk], List[ChunkProvenance]]:
        ...