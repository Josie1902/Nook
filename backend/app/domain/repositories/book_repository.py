import uuid
from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.book import Book


class BookRepository(ABC):
    @abstractmethod
    def add(self, book: Book) -> Book:
        ...

    @abstractmethod
    def get_by_id(self, book_id: uuid.UUID) -> Optional[Book]:
        ...

    @abstractmethod
    def list_by_user(self, user_id: uuid.UUID) -> List[Book]:
        ...

    @abstractmethod
    def update(self, book: Book) -> Book:
        ...