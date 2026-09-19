import uuid
from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.reading_session import ReadingSession


class ReadingSessionRepository(ABC):
    @abstractmethod
    def add(self, session: ReadingSession) -> ReadingSession:
        ...

    @abstractmethod
    def update(self, session: ReadingSession) -> ReadingSession:
        ...

    @abstractmethod
    def get_by_id(self, session_id: uuid.UUID) -> Optional[ReadingSession]:
        ...

    @abstractmethod
    def list_by_user(self, user_id: uuid.UUID) -> List[ReadingSession]:
        ...

    @abstractmethod
    def delete(self, session_id: uuid.UUID) -> None:
        ...