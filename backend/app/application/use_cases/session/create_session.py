from app.domain.entities.message import Message, MessageRole
from app.domain.entities.reading_session import ReadingSession
from app.domain.repositories.message_repository import MessageRepository
from app.domain.repositories.reading_session_repository import ReadingSessionRepository

DEFAULT_RESEARCH_MESSAGE = (
    "Curious about something? Start by asking a few questions below."
)


class CreateSessionUseCase:
    def __init__(
        self,
        session_repository: ReadingSessionRepository,
        message_repository: MessageRepository | None = None,
    ):
        self.session_repository = session_repository
        self.message_repository = message_repository

    def execute(self, user_id: str) -> ReadingSession:
        session = ReadingSession(user_id=user_id)
        session = self.session_repository.add(session)

        if self.message_repository is not None:
            self.message_repository.add(
                Message(
                    session_id=session.id,
                    sequence_number=self.message_repository.get_next_sequence_number(session.id),
                    content={"segments": [{
                        "text": DEFAULT_RESEARCH_MESSAGE,
                        "citation_ids": []
                    }], "citations": []},
                    role=MessageRole.ASSISTANT,
                )
            )

        return session