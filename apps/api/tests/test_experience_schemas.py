
from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.experience import (
    ExperienceCreate,
    ExperienceUpdate,
)


def valid_experience_data():
    return {
        "experience_type": "project",
        "title": "Proyecto de prueba",
        "organization": "TRAZA",
        "description": "Experiencia de prueba",
        "start_date": date(2026, 1, 1),
        "end_date": date(2026, 6, 1),
        "is_current": False,
        "visibility": "private",
    }


def test_create_accepts_valid_experience():
    experience = ExperienceCreate(**valid_experience_data())

    assert experience.title == "Proyecto de prueba"
    assert experience.is_current is False


def test_create_rejects_end_date_before_start_date():
    data = valid_experience_data()
    data["start_date"] = date(2026, 6, 1)
    data["end_date"] = date(2026, 1, 1)

    with pytest.raises(ValidationError):
        ExperienceCreate(**data)


def test_create_rejects_current_experience_with_end_date():
    data = valid_experience_data()
    data["is_current"] = True

    with pytest.raises(ValidationError):
        ExperienceCreate(**data)


def test_update_accepts_empty_patch():
    update = ExperienceUpdate()

    assert update.model_dump(exclude_unset=True) == {}


@pytest.mark.parametrize(
    "data",
    [
        {"start_date": None},
        {"experience_type": None},
        {"visibility": None},
    ],
)
def test_update_rejects_null_required_fields(data):
    with pytest.raises(ValidationError):
        ExperienceUpdate(**data)


def test_update_rejects_blank_title():
    with pytest.raises(ValidationError):
        ExperienceUpdate(title="   ")
