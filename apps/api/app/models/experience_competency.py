from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ExperienceCompetency(Base):
    __tablename__ = "experience_competencies"

    experience_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("experiences.id", ondelete="CASCADE"),
        primary_key=True,
    )
    competency_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("competencies.id", ondelete="RESTRICT"),
        primary_key=True,
    )
    proficiency_level: Mapped[str | None] = mapped_column(String(50))
    context_description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
