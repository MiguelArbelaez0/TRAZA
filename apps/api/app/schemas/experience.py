
from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


ExperienceType = Literal[
    "project",
    "work",
    "academic",
    "volunteer",
    "other",
]

ExperienceVisibility = Literal[
    "private",
    "unlisted",
    "public",
]


class ExperienceCreate(BaseModel):
    experience_type: ExperienceType
    title: str = Field(min_length=1, max_length=200)
    organization: str | None = Field(default=None, max_length=200)
    description: str | None = None
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    visibility: ExperienceVisibility = "private"

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El título es obligatorio.")
        return value

    @field_validator("organization")
    @classmethod
    def normalize_organization(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError(
                "La fecha de finalización no puede ser anterior "
                "a la fecha de inicio."
            )

        if self.is_current and self.end_date is not None:
            raise ValueError(
                "Una experiencia actual no puede tener fecha de finalización."
            )

        return self



class ExperienceUpdate(BaseModel):
    experience_type: ExperienceType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    organization: str | None = Field(default=None, max_length=200)
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    visibility: ExperienceVisibility | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("El título es obligatorio.")

        return value

    @field_validator("organization")
    @classmethod
    def normalize_organization(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None

    @model_validator(mode="after")
    def validate_update(self):
        supplied_fields = self.model_fields_set

        # Los campos pueden omitirse, pero no pueden enviarse como null
        # cuando el modelo necesita un valor obligatorio.
        required_fields = ("experience_type", "title", "start_date", "visibility")

        for field in required_fields:
            if field in supplied_fields and getattr(self, field) is None:
                raise ValueError(f"El campo {field} no puede ser null.")

        # Se comprueban las fechas cuando ambas están presentes en el PATCH.
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "La fecha de finalización no puede ser anterior "
                "a la fecha de inicio."
            )

        if self.is_current is True and self.end_date is not None:
            raise ValueError(
                "Una experiencia actual no puede tener fecha de finalización."
            )

        return self



class ExperienceResponse(BaseModel):
    id: UUID
    experience_type: str
    title: str
    organization: str | None
    description: str | None
    start_date: date
    end_date: date | None
    is_current: bool
    visibility: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
