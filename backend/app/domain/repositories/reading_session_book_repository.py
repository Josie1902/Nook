import uuid
from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.reading_session_book import ReadingSessionBook, SessionBookDetails


class ReadingSessionBookRepository(ABC):
    @abstractmethod
    def add(self, link: ReadingSessionBook) -> ReadingSessionBook:
        ...

    @abstractmethod
    def get_book_in_session(
        self, session_id: uuid.UUID, book_id: uuid.UUID
    ) -> Optional[ReadingSessionBook]:
        ...

    @abstractmethod
    def list_by_session(self, session_id: uuid.UUID) -> List[SessionBookDetails]:
        ...

    @abstractmethod
    def delete_book_in_session(self, session_id: uuid.UUID, book_id: uuid.UUID) -> None:
        ...