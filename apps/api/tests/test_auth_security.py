from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_profile_requires_authentication():
    response = client.get("/api/profile/me")
    assert response.status_code == 401


def test_profile_update_requires_authentication():
    response = client.patch(
        "/api/profile/me",
        json={
            "display_name": "Usuario de prueba",
            "headline": "Desarrollador",
            "professional_summary": "Perfil de prueba",
            "location": "Medellin",
        },
    )
    assert response.status_code == 401


def test_auth_me_requires_authentication():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_profile_rejects_invalid_bearer_token():
    response = client.get(
        "/api/profile/me",
        headers={"Authorization": "Bearer token-invalido"},
    )
    assert response.status_code == 401
