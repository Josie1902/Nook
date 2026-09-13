import uuid
from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.chunk import Chunk, ChunkProvenance


class ChunkRepository(ABC):
    @abstractmethod
    def add_many(self, chunks: list[Chunk], provenance: list[ChunkProvenance]) -> List[Chunk]:
        ...

    @abstractmethod
    def count_by_processing_run(self, processing_run_id: uuid.UUID) -> int:
        ...

    @abstractmethod
    def list_by_processing_run(self, processing_run_id: uuid.UUID) -> List[Chunk]:
        ...