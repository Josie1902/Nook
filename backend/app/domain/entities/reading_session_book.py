import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class ReadingSessionBook:
    session_id: uuid.UUID
    book_id: uuid.UUID
    added_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))