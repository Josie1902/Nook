import uuid
from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.chunk_embedding import ChunkEmbedding


class ChunkEmbeddingRepository(ABC):
    @abstractmethod
    def add_many(self, embeddings: List[ChunkEmbedding]) -> List[ChunkEmbedding]:
        ...

    @abstractmethod
    def count_by_chunk_ids(self, chunk_ids: List[uuid.UUID]) -> int:
        ...