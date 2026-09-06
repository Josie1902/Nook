from abc import ABC, abstractmethod

from app.domain.entities.book import Book


class PdfProcessor(ABC):
    @abstractmethod
    def process(self, book: Book) -> None:
        ...