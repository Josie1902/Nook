import uuid
from dataclasses import dataclass, field
from typing import List


@dataclass
class ChunkEmbedding:
    chunk_id: uuid.UUID
    provider: str
    model: str
    embedding: List[float]
    id: uuid.UUID = field(default_factory=uuid.uuid4)