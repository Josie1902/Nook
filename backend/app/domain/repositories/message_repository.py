from abc import ABC, abstractmethod
import uuid

from app.domain.entities.message import Message


class MessageRepository(ABC):
    @abstractmethod
    def add(self, message: Message) -> Message:
        ...

    @abstractmethod
    def get_next_sequence_number(self, session_id: uuid.UUID) -> int:
        ...

    @abstractmethod
    def list_by_session(self, session_id: uuid.UUID) -> list[Message]:
        ...