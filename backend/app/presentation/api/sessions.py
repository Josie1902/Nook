import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.domain.entities.reading_session import SessionMode

from app.application.use_cases.session.add_book_to_session import AddBookToSessionUseCase
from app.application.use_cases.session.create_session import CreateSessionUseCase
from app.application.use_cases.session.remove_book_from_session import RemoveBookFromSessionUseCase
from app.application.use_cases.session.update_session import UpdateSessionUseCase
from app.domain.entities.user import User
from app.presentation.api.dependencies import (
    get_answer_generator,
    get_book_repository,
    get_chunk_search_repository,
    get_current_user,
    get_embedding_provider,
    get_message_repository,
    get_reading_session_book_repository,
    get_reading_session_repository,
    get_retrieval_repository,
)
from app.presentation.api.schemas.session import (
    AddBookRequest,
    UpdateSessionRequest,
    SessionBookResponse,
    SessionDetailResponse,
    SessionResponse,
)
from app.application.use_cases.retrieval.ask_question import AskQuestionUseCase
from app.presentation.api.schemas.message import AskQuestionRequest, AskQuestionResponse, BoundingBoxResponse, ChunkProvenanceResponse, RetrievalMatchResponse

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


@router.post("/{session_id}/messages", response_model=AskQuestionResponse, status_code=status.HTTP_201_CREATED)
def ask_question(
    session_id: uuid.UUID,
    payload: AskQuestionRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
    message_repository=Depends(get_message_repository),
    retrieval_repository=Depends(get_retrieval_repository),
    chunk_search_repository=Depends(get_chunk_search_repository),
    embedding_provider=Depends(get_embedding_provider),
    answer_generator=Depends(get_answer_generator),
):
    use_case = AskQuestionUseCase(
        session_repository=session_repository,
        session_book_repository=session_book_repository,
        message_repository=message_repository,
        retrieval_repository=retrieval_repository,
        chunk_search_repository=chunk_search_repository,
        embedding_provider=embedding_provider,
        answer_generator=answer_generator,
    )
    try:
        result = use_case.execute(current_user.id, session_id, payload.content)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return AskQuestionResponse(
        message_id=result.user_message.id,
        assistant_message_id=result.assistant_message.id,
        answer=result.assistant_message.content,
        retrieval_id=result.retrieval.id,
        query=result.retrieval.query,
        created_at=result.retrieval.created_at,
        results=[
            RetrievalMatchResponse(
                chunk_id=m.chunk_id,
                book_id=m.book_id,
                content=m.content,
                page_start=m.page_start,
                page_end=m.page_end,
                score=m.score,
                rank=i,
                provenance=[
                    ChunkProvenanceResponse(
                        chunk_id=p.chunk_id,
                        page_number=p.page_number,
                        bounding_boxes=[
                            BoundingBoxResponse(
                                left=b.left,
                                top=b.top,
                                right=b.right,
                                bottom=b.bottom,
                            )
                            for b in p.bounding_boxes
                        ],
                    )
                    for p in m.provenance
                ],
            )
            for i, m in enumerate(result.matches)
        ],
    )