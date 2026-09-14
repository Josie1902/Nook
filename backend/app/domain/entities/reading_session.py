from enum import Enum
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

class SessionMode(str, Enum):
    RESEARCH="research"
    CHAT="chat"


@dataclass
class ReadingSession:
    user_id: str
    topic: str = "Untitled"
    mode: SessionMode = SessionMode.RESEARCH
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def update_topic(self, topic: str) -> None:
        self.topic = topic

    def chat_mode(self) -> None:
        self.mode = SessionMode.CHAT