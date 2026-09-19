from dataclasses import dataclass, field
import uuid


@dataclass
class CitationBoundingBoxDTO:
    left: float
    top: float
    right: float
    bottom: float


@dataclass
class CitationLocationDTO:
    page: int
    bounding_boxes: list[CitationBoundingBoxDTO] = field(
        default_factory=list
    )


@dataclass
class CitationDTO:
    id: uuid.UUID
    book_id: uuid.UUID
    book_title: str
    book_author: str
    quote: str
    page_start: int
    page_end: int
    order: int
    locations: list[CitationLocationDTO] = field(
        default_factory=list
    )
