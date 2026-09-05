from abc import ABC, abstractmethod


class PdfStorage(ABC):
    @abstractmethod
    def upload(self, storage_key: str, content: bytes) -> None:
        ...

    @abstractmethod
    def retrieve(self, storage_key: str) -> bytes:
        ...

    @abstractmethod
    def delete(self, storage_key: str) -> None:
        ...