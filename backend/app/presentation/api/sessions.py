import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.domain.entities.reading_session import SessionMode

from app.application.use_cases.session.add_book_to_session import AddBookToSessionUseCase
from app.application.use_cases.session.create_session import CreateSessionUseCase
from app.application.use_cases.session.remove_book_from_session import RemoveBookFromSessionUseCase
from app.application.use_cases.session.research_session import ResearchSessionUseCase
from app.application.use_cases.session.update_session import UpdateSessionUseCase
from app.domain.entities.user import User
from app.presentation.api.dependencies import (
    get_answer_generator,
    get_book_recommender,
    get_book_repository,
    get_chunk_search_repository,
    get_citation_repository,
    get_current_user,
    get_embedding_provider,
    get_message_repository,
    get_reading_session_book_repository,
    get_reading_session_repository,
    get_research_generator,
)
from app.presentation.api.schemas.session import (
    AddBookRequest,
    ConfirmedResearchBookResponse,
    UpdateSessionRequest,
    ResearchConfirmRequest,
    ResearchRefineRequest,
    ResearchRequest,
    ResearchSelectionBookResponse,
    ResearchSelectionResponse,
    ConfirmResearchResponse,
    SessionBookDetailResponse,
    SessionBookResponse,
    SessionDetailResponse,
    SessionResponse,
)
from app.application.use_cases.retrieval.ask_question import AskQuestionUseCase
from app.presentation.api.schemas.message import AnswerSegmentResponse, AskQuestionRequest, MessageResponse,AskQuestionResponse, BoundingBoxResponse, CitationLocationResponse, CitationResponse
from app.application.use_cases.session.confirm_research_selection import ConfirmResearchSelectionUseCase
from app.application.use_cases.session.list_books_in_session import ListBooksInSessionUseCase
from app.application.use_cases.session.list_messages import ListSessionMessagesUseCase
from app.domain.repositories.message_repository import MessageRepository
from app.application.use_cases.session.delete_session import DeleteSessionUseCase
from app.domain.repositories.citation_repository import CitationRepository

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
    message_repository=Depends(get_message_repository),
):
    use_case = CreateSessionUseCase(session_repository, message_repository)
    session = use_case.execute(current_user.id)
    return SessionResponse(id=session.id, topic=session.topic, created_at=session.created_at, mode=SessionMode.RESEARCH)

@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
):
    use_case = DeleteSessionUseCase(session_repository)
    use_case.execute(
        session_id=session_id,
        user_id=current_user.id,
    )
    
@router.patch("", response_model=SessionResponse)
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
):
    session = _get_owned_session(session_id, current_user, session_repository)
    return SessionDetailResponse(
        id=session.id,
        topic=session.topic,
        mode=session.mode,
        created_at=session.created_at,
        description=session.description,
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

@router.get(
    "/{session_id}/books",
    response_model=list[SessionBookDetailResponse],
    status_code=status.HTTP_200_OK,
)
def list_books_in_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
):
    use_case = ListBooksInSessionUseCase(
        session_repository,
        session_book_repository,
    )

    try:
        books = use_case.execute(current_user.id, session_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return [
        SessionBookDetailResponse(
            book_id=book.book_id,
            added_at=book.added_at,
            title=book.title,
            author=book.author,
            cover_url=book.cover_url,
        )
        for book in books
    ]

@router.post("/{session_id}/research", response_model=ResearchSelectionResponse)
def start_research(
    session_id: uuid.UUID,
    payload: ResearchRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    book_repository=Depends(get_book_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
    recommender=Depends(get_book_recommender),
    research_generator=Depends(get_research_generator),
):
    use_case = ResearchSessionUseCase(
        session_repository=session_repository,
        book_repository=book_repository,
        session_book_repository=session_book_repository,
        recommender=recommender,
        research_generator=research_generator,
    )
    try:
        result = use_case.start_research(current_user.id, session_id, payload.input)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return ResearchSelectionResponse(
        mode=result["mode"],
        topic=result["topic"],
        description=result["description"],
        books=[ResearchSelectionBookResponse(**book) for book in result["books"]],
    )


@router.post("/{session_id}/research/refine", response_model=ResearchSelectionResponse)
def refine_research(
    session_id: uuid.UUID,
    payload: ResearchRefineRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    book_repository=Depends(get_book_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
    recommender=Depends(get_book_recommender),
    research_generator=Depends(get_research_generator),
):
    use_case = ResearchSessionUseCase(
        session_repository=session_repository,
        book_repository=book_repository,
        session_book_repository=session_book_repository,
        recommender=recommender,
        research_generator=research_generator,
    )
    try:
        result = use_case.refine_research(
            current_user.id,
            session_id,
            topic=payload.topic,
            description=payload.description,
            book_ids=payload.book_ids,
            comments=payload.comments,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return ResearchSelectionResponse(
        mode=result["mode"],
        topic=result["topic"],
        description=result["description"],
        books=[ResearchSelectionBookResponse(**book) for book in result["books"]],
    )


@router.post("/{session_id}/research/confirm", response_model=ConfirmResearchResponse)
def confirm_research_selection(
    session_id: uuid.UUID,
    payload: ResearchConfirmRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    book_repository=Depends(get_book_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
):
    use_case = ConfirmResearchSelectionUseCase(
        session_repository=session_repository,
        book_repository=book_repository,
        session_book_repository=session_book_repository,
    )
    try:
        result = use_case.execute(
            current_user.id,
            session_id,
            topic=payload.topic,
            description=payload.description,
            book_ids=payload.book_ids,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return ConfirmResearchResponse(
        mode=result["mode"],
        topic=result["topic"],
        description=result["description"],
        books=[ConfirmedResearchBookResponse(**book) for book in result["books"]],
    )


@router.get("/{session_id}/messages", response_model=list[MessageResponse], status_code=status.HTTP_200_OK,
)
def list_messages(
    session_id: uuid.UUID,
    message_repository: MessageRepository = Depends(get_message_repository),
    citation_repository: CitationRepository = Depends(get_citation_repository)
):
    use_case = ListSessionMessagesUseCase(message_repository, citation_repository)

    messages = use_case.execute(session_id)

    return [
        MessageResponse(
            id=message.id,
            role=message.role.value,
            content=message.content,
            error_message=message.error_message,
            created_at=message.created_at,
        )
        for message in messages
    ]

@router.post(
    "/{session_id}/messages",
    response_model=AskQuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def ask_question(
    session_id: uuid.UUID,
    payload: AskQuestionRequest,
    current_user: User = Depends(get_current_user),
    session_repository=Depends(get_reading_session_repository),
    session_book_repository=Depends(get_reading_session_book_repository),
    message_repository=Depends(get_message_repository),
    chunk_search_repository=Depends(get_chunk_search_repository),
    embedding_provider=Depends(get_embedding_provider),
    answer_generator=Depends(get_answer_generator),
    citation_repository=Depends(get_citation_repository),
):
    session = session_repository.get_by_id(session_id)

    if session is None or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.mode == SessionMode.RESEARCH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the research endpoints while the session is in RESEARCH mode.",
        )

    use_case = AskQuestionUseCase(
        session_repository=session_repository,
        session_book_repository=session_book_repository,
        message_repository=message_repository,
        chunk_search_repository=chunk_search_repository,
        embedding_provider=embedding_provider,
        answer_generator=answer_generator,
        citation_repository=citation_repository,
    )

    try:
        result = use_case.execute(
            current_user.id,
            session_id,
            payload.content,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return AskQuestionResponse(
        message_id=result.user_message.id,
        assistant_message_id=result.assistant_message.id,
        segments=[
            AnswerSegmentResponse(
                text=segment["text"],
                citation_ids=[
                    uuid.UUID(citation_id)
                    for citation_id in segment["citation_ids"]
                ],
            )
            for segment in result.assistant_message.content["segments"]
        ],
        citations=[
            CitationResponse(
                id=citation.id,
                book_id=citation.book_id,
                book_title=citation.book_title,
                book_author=citation.book_author,
                quote=citation.quote,
                page_start=citation.page_start,
                page_end=citation.page_end,
                order=citation.order,
                locations=[
                    CitationLocationResponse(
                        page=location.page,
                        bounding_boxes=[
                            BoundingBoxResponse(
                                left=box.left,
                                top=box.top,
                                right=box.right,
                                bottom=box.bottom,
                            )
                            for box in location.bounding_boxes
                        ],
                    )
                    for location in citation.locations
                ],
            )
            for citation in result.citations
        ],
    )
