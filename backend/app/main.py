import sys, os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

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

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.endpoints.predict import router as predict_router
from app.ml.model_loader import preload_models

app.include_router(api_router, prefix="/api/v1")
app.include_router(predict_router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation error",
            "errors": exc.errors(),
            "status_code": 422,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "status_code": 500,
        },
    )


@app.on_event("startup")
def on_startup():
    # Dev convenience: auto-create tables if they don't exist yet.
    Base.metadata.create_all(bind=engine)

    # Preload AI models into memory once at startup
    preload_models()

    try:
        from scripts.seed_demo_data import run as seed_run
        seed_run()
    except Exception:
        pass


@app.get("/")
def root():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
