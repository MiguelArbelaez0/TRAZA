import sys
from pathlib import Path

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[1]),
)

import app.models  # Registra los modelos en la metadata.
from app.db.base import Base


def test_evidence_experience_profile_fk_uses_restrict():
    table = Base.metadata.tables["evidences"]

    constraint = next(
        c for c in table.foreign_key_constraints
        if c.name == "fk_evidences_experience_profile"
    )

    assert constraint.ondelete == "RESTRICT"
    assert {fk.parent.name for fk in constraint.elements} == {
        "experience_id",
        "profile_id",
    }
    assert {fk.target_fullname for fk in constraint.elements} == {
        "experiences.id",
        "experiences.profile_id",
    }


def test_evidence_profile_fk_uses_restrict():
    table = Base.metadata.tables["evidences"]

    constraint = next(
        c for c in table.foreign_key_constraints
        if c.name == "fk_evidences_profile_id_profiles"
    )

    assert constraint.ondelete == "RESTRICT"


def test_experience_has_composite_unique_constraint():
    table = Base.metadata.tables["experiences"]

    assert any(
        c.name == "uq_experiences_id_profile"
        and {column.name for column in c.columns}
        == {"id", "profile_id"}
        for c in table.constraints
    )


def test_experience_competency_delete_policies():
    table = Base.metadata.tables["experience_competencies"]

    policies = {
        fk.parent.name: fk.ondelete
        for constraint in table.foreign_key_constraints
        for fk in constraint.elements
    }

    assert policies["experience_id"] == "CASCADE"
    assert policies["competency_id"] == "RESTRICT"
