from typing import Any
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Retrieval:
    message_id: uuid.UUID
    query: str
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, Any] = field(default_factory=dict)
