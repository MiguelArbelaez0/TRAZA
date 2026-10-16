
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.evidence import Evidence
from app.models.experience import Experience
from app.models.profile import Profile
from app.models.user import User
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
)

router = APIRouter(
    prefix="/api/experiences",
    tags=["Experiencias"],
)

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


def get_user_experience(
    db: Session,
    profile_id: UUID,
    experience_id: UUID,
) -> Experience:
    experience = db.scalar(
        select(Experience).where(
            Experience.id == experience_id,
            Experience.profile_id == profile_id,
        )
    )

    if experience is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la experiencia solicitada.",
        )

    return experience


@router.get("", response_model=list[ExperienceResponse])
def list_experiences(
    user: CurrentUser,
    db: DbSession,
) -> list[Experience]:
    profile = get_user_profile(db, user)

    statement = (
        select(Experience)
        .where(Experience.profile_id == profile.id)
        .order_by(Experience.created_at.desc())
    )

    return list(db.scalars(statement).all())


@router.get("/{experience_id}", response_model=ExperienceResponse)
def read_experience(
    experience_id: UUID,
    user: CurrentUser,
    db: DbSession,
) -> Experience:
    profile = get_user_profile(db, user)

    return get_user_experience(
        db,
        profile.id,
        experience_id,
    )


@router.post(
    "",
    response_model=ExperienceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_experience(
    payload: ExperienceCreate,
    user: CurrentUser,
    db: DbSession,
) -> Experience:
    profile = get_user_profile(db, user)

    experience = Experience(
        profile_id=profile.id,
        experience_type=payload.experience_type,
        title=payload.title,
        organization=payload.organization,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_current=payload.is_current,
        visibility=payload.visibility,
    )

    db.add(experience)

    try:
        db.commit()
        db.refresh(experience)
    except Exception:
        db.rollback()
        raise

    return experience



@router.patch(
    "/{experience_id}",
    response_model=ExperienceResponse,
)
def update_experience(
    experience_id: UUID,
    payload: ExperienceUpdate,
    user: CurrentUser,
    db: DbSession,
) -> Experience:
    profile = get_user_profile(db, user)
    experience = get_user_experience(
        db,
        profile.id,
        experience_id,
    )

    changes = payload.model_dump(exclude_unset=True)

    # Construir el estado final sin modificar todavía el objeto ORM.
    start_date = changes.get("start_date", experience.start_date)
    end_date = changes.get("end_date", experience.end_date)
    is_current = changes.get("is_current", experience.is_current)

    if start_date is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha de inicio es obligatoria.",
        )

    if end_date is not None and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "La fecha de finalización no puede ser anterior "
                "a la fecha de inicio."
            ),
        )

    if is_current and end_date is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Una experiencia actual no puede tener fecha "
                "de finalización."
            ),
        )

    for field, value in changes.items():
        setattr(experience, field, value)

    try:
        db.commit()
        db.refresh(experience)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Los cambios incumplen una restricción de integridad.",
        ) from None
    except Exception:
        db.rollback()
        raise

    return experience

@router.delete(
    "/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_experience(
    experience_id: UUID,
    user: CurrentUser,
    db: DbSession,
) -> Response:
    profile = get_user_profile(db, user)
    experience = get_user_experience(
        db,
        profile.id,
        experience_id,
    )

    # Las evidencias deben conservarse; no se eliminan en cascada.
    evidence_exists = db.scalar(
        select(Evidence.id)
        .where(
            Evidence.experience_id == experience.id,
            Evidence.profile_id == profile.id,
        )
        .limit(1)
    )

    if evidence_exists is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No se puede eliminar la experiencia porque tiene "
                "evidencias asociadas. Desvincúlalas primero."
            ),
        )

    try:
        db.delete(experience)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No se puede eliminar la experiencia porque tiene "
                "registros relacionados."
            ),
        ) from None
    except Exception:
        db.rollback()
        raise

    return Response(status_code=status.HTTP_204_NO_CONTENT)
