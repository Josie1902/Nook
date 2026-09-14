import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

from app.domain.entities.chunk import ChunkProvenance

@dataclass
class ChunkSearchMatch:
    chunk_id: uuid.UUID
    book_id: uuid.UUID
    book_title: str
    book_author: str
    content: str
    page_start: int
    page_end: int
    score: float
    provenance: tuple[ChunkProvenance, ...] = ()


class ChunkSearchRepository(ABC):
    @abstractmethod
    def search(
        self, book_ids: List[uuid.UUID], query_embedding: List[float], top_k: int
    ) -> List[ChunkSearchMatch]:
        ...