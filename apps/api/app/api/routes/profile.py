from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/api/profile", tags=["Perfil"])
DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def get_user_profile(db: Session, user: User) -> Profile:
    profile = db.scalar(
        select(Profile).where(Profile.auth_user_id == user.id)
    )
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el perfil del usuario.",
        )
    return profile


@router.get("/me", response_model=ProfileResponse)
def read_my_profile(user: CurrentUser, db: DbSession) -> Profile:
    return get_user_profile(db, user)


@router.patch("/me", response_model=ProfileResponse)
def update_my_profile(
    payload: ProfileUpdateRequest,
    user: CurrentUser,
    db: DbSession,
) -> Profile:
    profile = get_user_profile(db, user)

    profile.display_name = payload.display_name
    profile.headline = payload.headline
    profile.professional_summary = payload.professional_summary
    profile.location = payload.location

    try:
        db.commit()
        db.refresh(profile)
    except Exception:
        db.rollback()
        raise

    return profile
