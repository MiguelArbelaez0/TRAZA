from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


if settings.database_url:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
    )
    SessionLocal = sessionmaker(
        bind=engine,
        class_=Session,
        autoflush=False,
        expire_on_commit=False,
    )
else:
    engine = None
    SessionLocal = None


def get_db() -> Generator[Session, None, None]:
    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL no está configurada. Revisa el .env privado."
        )

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
