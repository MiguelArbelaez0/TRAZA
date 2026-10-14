from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def create_session_factory() -> sessionmaker[Session]:
    if not settings.database_url:
        raise RuntimeError(
            "DATABASE_URL no está configurada. "
            "Define la variable de entorno antes de usar la base de datos."
        )

    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
    )

    return sessionmaker(
        bind=engine,
        class_=Session,
        autoflush=False,
        expire_on_commit=False,
    )


def get_db() -> Generator[Session, None, None]:
    session_factory = create_session_factory()
    db = session_factory()

    try:
        yield db
    finally:
        db.close()
