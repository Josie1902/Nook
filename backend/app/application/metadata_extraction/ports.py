from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


@dataclass
class PdfMetadata:
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None


@dataclass
class MetadataResult:
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    publication_year: Optional[int] = None
    cover_url: Optional[str] = None
    tags: List[str] = field(default_factory=list)


class PdfMetadataExtractor(ABC):
    @abstractmethod
    def extract(self, content: bytes) -> PdfMetadata:
        ...


class DocumentTextExtractor(ABC):
    @abstractmethod
    def extract_first_pages_text(self, content: bytes, max_pages: int = 5) -> str:
        ...


class BookIdentityResolver(ABC):
    @abstractmethod
    def resolve(self, filename: str, pdf_metadata: PdfMetadata, first_pages_text: str,
    ) -> PdfMetadata:
        ...

class MetadataProvider(ABC):
    @abstractmethod
    def search_by_isbn(self, isbn: str) -> MetadataResult:
        ...

    @abstractmethod
    def search_by_title_author(self, title: Optional[str], author: Optional[str]) -> MetadataResult:
        ...