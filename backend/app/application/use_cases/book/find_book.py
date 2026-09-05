import uuid
from typing import List, Optional

from app.domain.entities.book import Book
from app.domain.repositories.book_repository import BookRepository


class FindBookUseCase:
    def __init__(self, book_repository: BookRepository):
        self.book_repository = book_repository

    def by_id(self, book_id: uuid.UUID) -> Optional[Book]:
        return self.book_repository.get_by_id(book_id)

    def by_user(self, user_id: uuid.UUID) -> List[Book]:
        return self.book_repository.list_by_user(user_id)