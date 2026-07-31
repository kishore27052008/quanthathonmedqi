from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

db_url = settings.get_database_url()
_connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {"connect_timeout": 2}

try:
    engine = create_engine(db_url, pool_pre_ping=True, connect_args=_connect_args)
    # Test DB connection on startup
    with engine.connect() as conn:
        pass
except Exception:
    # Fallback to local SQLite database if PostgreSQL server is not running
    sqlite_url = "sqlite:///./medq.db"
    engine = create_engine(sqlite_url, pool_pre_ping=True, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

