"""
Database Configuration and Connection Management
PostgreSQL with pgvector extension setup for LearnInSlices
"""

import os
from typing import AsyncGenerator
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from .models import Base


# Database URLs
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://learninslices:password@localhost:5432/learninslices"
)

ASYNC_DATABASE_URL = os.getenv(
    "ASYNC_DATABASE_URL",
    "postgresql+asyncpg://learninslices:password@localhost:5432/learninslices"
)

# Test database (SQLite for testing)
TEST_DATABASE_URL = "sqlite:///./test_learninslices.db"


# Synchronous database engine and session
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true"
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Asynchronous database engine and session
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    future=True
)

AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False
)

# Test database engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=True
)

TestSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


def get_db() -> Session:
    """
    Dependency to get database session for synchronous operations
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get async database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def create_tables():
    """
    Create all database tables
    """
    Base.metadata.create_all(bind=engine)


async def create_tables_async():
    """
    Create all database tables asynchronously
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def drop_tables():
    """
    Drop all database tables (for testing)
    """
    Base.metadata.drop_all(bind=engine)


async def init_database():
    """
    Initialize database with extensions and initial data
    """
    async with async_engine.begin() as conn:
        # Enable pgvector extension for vector similarity search
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            print("✓ pgvector extension enabled")
        except Exception as e:
            print(f"Warning: Could not enable pgvector extension: {e}")

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Database tables created")


async def check_database_connection():
    """
    Check database connectivity and extensions
    """
    try:
        async with async_engine.begin() as conn:
            # Test basic connection
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar() == 1

            # Check pgvector extension
            try:
                await conn.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
                pgvector_available = True
            except Exception:
                pgvector_available = False

            return {
                "database_connected": True,
                "pgvector_available": pgvector_available,
                "database_url": ASYNC_DATABASE_URL.split("@")[1] if "@" in ASYNC_DATABASE_URL else "hidden"}
    except Exception as e:
        return {
            "database_connected": False,
            "error": str(e)
        }


# Database health check function
async def health_check() -> dict:
    """
    Comprehensive database health check
    """
    try:
        async with AsyncSessionLocal() as session:
            # Test query
            result = await session.execute(text("SELECT NOW()"))
            timestamp = result.scalar()

            # Count tables
            tables_result = await session.execute(text("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'public'
            """))
            table_count = tables_result.scalar()

            return {
                "status": "healthy",
                "timestamp": timestamp,
                "table_count": table_count,
                "connection_pool_size": async_engine.pool.size(),
                "checked_out_connections": async_engine.pool.checkedout()
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


# Context managers for testing
class TestDatabase:
    """Context manager for test database operations"""

    def __enter__(self):
        """Setup test database"""
        Base.metadata.create_all(bind=test_engine)
        self.session = TestSessionLocal()
        return self.session

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Cleanup test database"""
        self.session.close()
        Base.metadata.drop_all(bind=test_engine)


# Migration helpers
def run_migrations():
    """
    Run Alembic migrations programmatically
    """
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


def create_migration(message: str):
    """
    Create a new Alembic migration
    """
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    command.revision(alembic_cfg, autogenerate=True, message=message)
