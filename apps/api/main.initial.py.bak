from fastapi import FastAPI

app = FastAPI(
    title="TRAZA API",
    description="API para gestionar trayectorias profesionales, competencias y evidencias.",
    version="0.1.0",
)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "traza-api",
        "version": "0.1.0",
    }


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    return {
        "message": "Bienvenido a TRAZA API",
        "docs": "/docs",
    }
