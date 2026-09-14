import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Citation:
    message_id: uuid.UUID
    book_title: str
    book_author: str
    page_start: int
    page_end: int
    quote: str
    order: int

    # For provenance linking
    book_id: uuid.UUID
    chunk_id: uuid.UUID

    id: uuid.UUID = field(default_factory=uuid.uuid4)
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )