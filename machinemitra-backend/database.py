import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configured for PostgreSQL / TimescaleDB (or SQLite fallback for zero-setup local dev)
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./machinemitra.db" # Replace with: "postgresql://user:password@localhost:5432/machinemitra"
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()