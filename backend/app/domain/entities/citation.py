import uuid
from dataclasses import dataclass, field


@dataclass
class Citation:
    message_id: uuid.UUID
    book_id: uuid.UUID
    chunk_id: uuid.UUID
    book_title: str
    book_author: str
    quote: str
    page_start: int
    page_end: int
    order: int = 0
    id: uuid.UUID = field(default_factory=uuid.uuid4)