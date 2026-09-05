import uuid
from abc import ABC, abstractmethod


class TaskPublisher(ABC):
    @abstractmethod
    def publish_process_book(self, book_id: uuid.UUID) -> None:
        ...