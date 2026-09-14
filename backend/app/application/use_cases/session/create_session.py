from app.domain.entities.reading_session import ReadingSession
from app.domain.repositories.reading_session_repository import ReadingSessionRepository


class CreateSessionUseCase:
    def __init__(self, session_repository: ReadingSessionRepository):
        self.session_repository = session_repository

    def execute(self, user_id: str) -> ReadingSession:
        session = ReadingSession(user_id=user_id)
        return self.session_repository.add(session)