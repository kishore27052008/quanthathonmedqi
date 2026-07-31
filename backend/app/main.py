from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.router import api_router

# Import models so they register on Base.metadata before create_all runs
from app.models import user, patient, risk_assessment  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    description="Hybrid Quantum-AI Clinical Decision Support Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    # Dev convenience: auto-create tables if they don't exist yet.
    # For production, use Alembic migrations instead (see README).
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
