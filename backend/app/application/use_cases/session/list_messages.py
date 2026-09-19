import uuid

from app.domain.entities.citation import Citation
from app.domain.entities.message import Message, MessageRole
from app.domain.repositories.citation_repository import CitationRepository
from app.domain.repositories.message_repository import MessageRepository


class ListSessionMessagesUseCase:
    def __init__(
        self,
        message_repository: MessageRepository,
        citation_repository: CitationRepository,
    ):
        self.message_repository = message_repository
        self.citation_repository = citation_repository

    def execute(self, session_id: uuid.UUID) -> list[Message]:
        messages = self.message_repository.list_by_session(session_id)

        assistant_message_ids = [
            message.id
            for message in messages
            if message.role == MessageRole.ASSISTANT
        ]

        if not assistant_message_ids:
            return messages

        citations_by_message_id: dict[uuid.UUID, list[Citation]] = {}

        for message_id in assistant_message_ids:
            citations_by_message_id[message_id] = (
                self.citation_repository.list_by_message(message_id)
            )


        for message in messages:
            if message.role != MessageRole.ASSISTANT:
                continue

            citations = citations_by_message_id.get(message.id, [])

            message.add_citations([
                {
                    "id": str(citation.id),
                    "book_id": str(citation.book_id),
                    "book_title": citation.book_title,
                    "book_author": citation.book_author,
                    "quote": citation.quote,
                    "locations": [
                        {
                            "page": location.page,
                            "bounding_boxes": [
                                {
                                    "left": box.left,
                                    "top": box.top,
                                    "right": box.right,
                                    "bottom": box.bottom,
                                }
                                for box in location.bounding_boxes
                            ],
                        }
                        for location in citation.locations
                    ],
                }
                for citation in citations
            ])

        return messages