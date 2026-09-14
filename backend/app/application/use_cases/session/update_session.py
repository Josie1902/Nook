from app.domain.entities.reading_session import ReadingSession
from app.domain.repositories.reading_session_repository import ReadingSessionRepository


class UpdateSessionUseCase:
    def __init__(self, session_repository: ReadingSessionRepository):
        self.session_repository = session_repository

    def execute(self, user_id: str, topic: str) -> ReadingSession:
        session = ReadingSession(user_id=user_id)
        session.update_topic(topic)
        session.chat_mode()
        return self.session_repository.update(session)