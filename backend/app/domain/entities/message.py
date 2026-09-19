from typing import Any
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# Content would probably look like this
# content = {
#     "text": "The author argues that...",
#     "citations": [
#         {
#             "citation_id": "abc",
#             "page_start": 12,
#             "page_end": 14,
#         }
#     ],
# }

@dataclass
class Message:
    session_id: uuid.UUID
    sequence_number: int
    content: dict[str, Any]
    error_message: str | None = None

    id: uuid.UUID = field(default_factory=uuid.uuid4)
    role: MessageRole = MessageRole.USER
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def add_citations(self, citations: list[dict[str, Any]]) -> None:
        self.content["citations"] = citations