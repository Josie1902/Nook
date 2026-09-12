import uuid
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Chunk:
    processing_run_id: uuid.UUID
    chunk_index: int
    page_start: int
    page_end: int
    content: str
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    chapter_title: Optional[str] = None


@dataclass(frozen=True)
class BoundingBox:
    left: float
    top: float
    right: float
    bottom: float


@dataclass(frozen=True)
class ChunkProvenance:
    chunk_id: uuid.UUID
    page_number: int
    bounding_boxes: tuple[BoundingBox, ...]