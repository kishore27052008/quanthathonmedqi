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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    # Dev convenience: auto-create tables if they don't exist yet.
    Base.metadata.create_all(bind=engine)
    try:
        from scripts.seed_demo_data import run as seed_run
        seed_run()
    except Exception:
        pass


@app.get("/")
def root():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
