from fastapi import APIRouter, Depends

from app.domain.entities.user import User
from app.presentation.api.dependencies import get_current_user
from app.presentation.api.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
    )