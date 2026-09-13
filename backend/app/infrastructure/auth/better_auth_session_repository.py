from sqlalchemy import text
from sqlalchemy.orm import Session

from app.domain.entities.user import User
from app.domain.repositories.session_repository import SessionRepository


class BetterAuthSessionRepository(SessionRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_session_token(self, token: str) -> User | None:

        query = text("""
            SELECT
                u.id,
                u.name,
                u.email
            FROM session s
            INNER JOIN "user" u
                ON u.id = s."userId"
            WHERE s.token = :token
              AND s."expiresAt" > CURRENT_TIMESTAMP
        """)

        result = self.db.execute(
            query,
            {"token": token},
        ).mappings().first()

        if result is None:
            return None

        return User(
            id=result["id"],
            name=result["name"],
            email=result["email"],
        )