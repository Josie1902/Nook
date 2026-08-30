from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.infrastructure.auth.db.session import SessionLocal
from app.domain.entities.user import User
from app.infrastructure.auth.better_auth_session_repository import (
    BetterAuthSessionRepository,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_session_repository(
    db: Session = Depends(get_db),
) -> BetterAuthSessionRepository:
    return BetterAuthSessionRepository(db)


def get_current_user(
    request: Request,
    session_repository: BetterAuthSessionRepository = Depends(
        get_session_repository
    ),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    # Better Auth session cookie
    token = request.cookies.get("better-auth.session_token")

    if not token:
        raise credentials_exception

    user = session_repository.get_user_by_session_token(token)

    if user is None:
        raise credentials_exception

    return user