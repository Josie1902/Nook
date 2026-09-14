import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.domain.entities.reading_session import SessionMode

from app.application.use_cases.session.add_book_to_session import AddBookToSessionUseCase
from app.application.use_cases.session.create_session import CreateSessionUseCase
from app.application.use_cases.session.remove_book_from_session import RemoveBookFromSessionUseCase
from app.application.use_cases.session.update_session import UpdateSessionUseCase
from app.domain.entities.user import User
from app.presentation.api.dependencies import (
    get_book_repository,
    get_current_user,
    get_reading_session_book_repository,
    get_reading_session_repository,
)
from app.presentation.api.schemas.session import (
    AddBookRequest,
    UpdateSessionRequest,
    SessionBookResponse,
    SessionDetailResponse,
    SessionResponse,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _get_owned_session(session_id: uuid.UUID, current_user: User, session_repository):
    session = session_repository.get_by_id(session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
):
    use_case = CreateSessionUseCase(session_repository)
    session = use_case.execute(current_user.id)
    return SessionResponse(id=session.id, topic=session.topic, created_at=session.created_at, mode=SessionMode.RESEARCH)

@router.put("", response_model=SessionResponse)
def update_session(
    payload: UpdateSessionRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
):
    use_case = UpdateSessionUseCase(session_repository)
    session = use_case.execute(current_user.id, payload.topic)
    return SessionResponse(id=session.id, topic=session.topic, created_at=session.created_at, mode=SessionMode.CHAT)

@router.get("", response_model=list[SessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
):
    sessions = session_repository.list_by_user(current_user.id)
    return [SessionResponse(id=s.id, topic=s.topic, created_at=s.created_at, mode=s.mode) for s in sessions]


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
):
    session = _get_owned_session(session_id, current_user, session_repository)
    links = session_book_repository.list_by_session(session_id)
    return SessionDetailResponse(
        id=session.id,
        topic=session.topic,
        mode=session.mode,
        created_at=session.created_at,
        books=[SessionBookResponse(book_id=l.book_id, added_at=l.added_at) for l in links],
    )


@router.post("/{session_id}/books", response_model=SessionBookResponse, status_code=status.HTTP_201_CREATED)
def add_book_to_session(
    session_id: uuid.UUID,
    payload: AddBookRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    book_repository=Depends(get_book_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
):
    use_case = AddBookToSessionUseCase(session_repository, book_repository, session_book_repository)
    try:
        link = use_case.execute(current_user.id, session_id, payload.book_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return SessionBookResponse(book_id=link.book_id, added_at=link.added_at)


@router.delete("/{session_id}/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book_from_session(
    session_id: uuid.UUID,
    book_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
):
    use_case = RemoveBookFromSessionUseCase(session_repository, session_book_repository)
    try:
        use_case.execute(current_user.id, session_id, book_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))