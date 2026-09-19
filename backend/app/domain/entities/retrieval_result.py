import uuid
from dataclasses import dataclass, field


@dataclass
class RetrievalResult:
    retrieval_id: uuid.UUID
    chunk_id: uuid.UUID
    rank: int
    score: float
    id: uuid.UUID = field(default_factory=uuid.uuid4)