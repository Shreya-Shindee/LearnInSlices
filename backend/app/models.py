"""
LearnInSlices - Core Data Models
SQLAlchemy models for users, micro-cards, spaced repetition, and gamification

Key Models:
- User: Authentication and profile management
- Skill: Learning domains and competencies
- MicroCard: Bite-sized learning content with metadata
- Review: Spaced repetition tracking with performance metrics
- XPTransaction: Gamification points and achievement system
- PeerRoom: Real-time study groups and collaboration
"""

from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, Float,
    ForeignKey, JSON, Enum, Index, UniqueConstraint, Table
)
from sqlalchemy.orm import DeclarativeBase, relationship, validates
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid


class Base(DeclarativeBase):
    pass


class DifficultyLevel(PyEnum):
    """Content difficulty enumeration"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CardType(PyEnum):
    """MicroCard content type enumeration"""
    CONCEPT = "concept"          # Text explanation with examples
    QUIZ = "quiz"               # Multiple choice or fill-in-blank
    DRILL = "drill"             # Practice exercises
    VIDEO = "video"             # Video content with transcript
    INTERACTIVE = "interactive"  # Hands-on coding/simulation


class ReviewResult(PyEnum):
    """Spaced repetition review outcomes"""
    EASY = "easy"               # Confident recall, extend interval
    GOOD = "good"               # Normal recall, moderate extension
    HARD = "hard"               # Difficult recall, minimal extension
    AGAIN = "again"             # Failed recall, reset interval


class XPEventType(PyEnum):
    """Experience point event categories"""
    CARD_COMPLETED = "card_completed"
    REVIEW_SUCCESS = "review_success"
    STREAK_MILESTONE = "streak_milestone"
    PEER_HELP = "peer_help"
    DAILY_GOAL = "daily_goal"


class User(Base):
    """
    User profile and authentication model
    Stores learner preferences, goals, and account metadata
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Profile information
    full_name = Column(String(100))
    bio = Column(Text)
    avatar_url = Column(String(500))
    timezone = Column(String(50), default="UTC")

    # Learning preferences
    daily_goal_minutes = Column(Integer, default=15)  # Target study time
    preferred_difficulty = Column(
        Enum(DifficultyLevel),
        default=DifficultyLevel.BEGINNER)
    learning_streak = Column(Integer, default=0)

    # Account metadata
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(
        DateTime(
            timezone=True), default=lambda: datetime.now(
            timezone.utc))
    last_login = Column(DateTime(timezone=True))

    # Relationships
    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan")
    xp_transactions = relationship(
        "XPTransaction",
        back_populates="user",
        cascade="all, delete-orphan")
    peer_rooms = relationship(
        "PeerRoom",
        secondary="user_peer_rooms",
        back_populates="participants")

    @validates('email')
    def validate_email(self, key, email):
        """Basic email validation"""
        if '@' not in email:
            raise ValueError("Invalid email format")
        return email.lower()

    @property
    def total_xp(self) -> int:
        """Calculate total experience points"""
        return sum(tx.points for tx in self.xp_transactions)

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"


class Skill(Base):
    """
    Learning skill/competency domain
    Hierarchical structure for organizing micro-cards and tracking progress
    """
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)

    # Hierarchy support
    parent_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"))
    level = Column(Integer, default=0)  # 0=root, 1=category, 2=subcategory

    # Metadata
    difficulty_level = Column(
        Enum(DifficultyLevel),
        default=DifficultyLevel.BEGINNER)
    estimated_hours = Column(Float)  # Expected time to master
    prerequisites = Column(ARRAY(String))  # Required skill slugs
    tags = Column(ARRAY(String))  # Searchable keywords

    # OER integration
    source_urls = Column(ARRAY(String))  # Educational resource links
    embedding_vector = Column(ARRAY(Float))  # For semantic search

    created_at = Column(
        DateTime(
            timezone=True), default=lambda: datetime.now(
            timezone.utc))
    updated_at = Column(
        DateTime(
            timezone=True), onupdate=lambda: datetime.now(
            timezone.utc))

    # Relationships
    parent = relationship("Skill", remote_side=[id], backref="children")
    micro_cards = relationship(
        "MicroCard",
        back_populates="skill",
        cascade="all, delete-orphan")

    __table_args__ = (
        Index(
            'ix_skills_tags',
            'tags',
            postgresql_using='gin'),
        Index(
            'ix_skills_embedding',
            'embedding_vector',
            postgresql_using='ivfflat'),
    )

    def __repr__(self):
        return f"<Skill(name='{self.name}', level={self.level})>"


class MicroCard(Base):
    """
    Bite-sized learning content with spaced repetition support
    Contains the core educational material and metadata for adaptive scheduling
    """
    __tablename__ = "micro_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(
        UUID(
            as_uuid=True),
        ForeignKey("skills.id"),
        nullable=False)

    # Content structure
    title = Column(String(200), nullable=False, index=True)
    content_type = Column(Enum(CardType), nullable=False)
    content = Column(JSON, nullable=False)  # Flexible content storage

    # Learning metadata
    difficulty_level = Column(Enum(DifficultyLevel), nullable=False)
    estimated_time_minutes = Column(Integer, default=5)
    learning_objectives = Column(ARRAY(String))

    # Spaced repetition parameters
    ease_factor = Column(Float, default=2.5)  # SM2 algorithm ease
    interval_days = Column(Integer, default=1)  # Current review interval
    repetitions = Column(Integer, default=0)  # Successful review count

    # Content source and quality
    source_url = Column(String(500))
    author = Column(String(100))
    quality_score = Column(Float, default=0.0)  # 0-1 based on user feedback

    # AI generation metadata
    generated_by_ai = Column(Boolean, default=False)
    generation_prompt = Column(Text)
    embedding_vector = Column(ARRAY(Float))

    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime(
            timezone=True), default=lambda: datetime.now(
            timezone.utc))
    updated_at = Column(
        DateTime(
            timezone=True), onupdate=lambda: datetime.now(
            timezone.utc))

    # Relationships
    skill = relationship("Skill", back_populates="micro_cards")
    reviews = relationship(
        "Review",
        back_populates="micro_card",
        cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_micro_cards_content_type', 'content_type'),
        Index('ix_micro_cards_difficulty', 'difficulty_level'),
        Index(
            'ix_micro_cards_embedding',
            'embedding_vector',
            postgresql_using='ivfflat'
        ),
    )

    @validates('content')
    def validate_content(self, key, content):
        """Validate content structure based on card type"""
        required_fields = {
            CardType.CONCEPT: ['text', 'examples'],
            CardType.QUIZ: ['question', 'options', 'correct_answer'],
            CardType.DRILL: ['instructions', 'exercises'],
            CardType.VIDEO: ['video_url', 'transcript'],
            CardType.INTERACTIVE: ['description', 'interactive_elements']
        }

        if self.content_type in required_fields:
            for field in required_fields[self.content_type]:
                if field not in content:
                    raise ValueError(
                        f"Missing required field '{field}' for {
                            self.content_type} card")

        return content

    def __repr__(self):
        return f"<MicroCard(title='{
            self.title}', type={
            self.content_type.value})>"


class Review(Base):
    """
    Spaced repetition review session tracking
    Records user performance and calculates next review scheduling
    """
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(
            as_uuid=True),
        ForeignKey("users.id"),
        nullable=False)
    micro_card_id = Column(
        UUID(
            as_uuid=True),
        ForeignKey("micro_cards.id"),
        nullable=False)

    # Review session data
    result = Column(Enum(ReviewResult), nullable=False)
    confidence_level = Column(Integer)  # 1-5 self-reported confidence
    time_spent_seconds = Column(Integer)

    # Spaced repetition calculation
    previous_ease_factor = Column(Float)
    new_ease_factor = Column(Float)
    previous_interval_days = Column(Integer)
    new_interval_days = Column(Integer)
    next_review_date = Column(DateTime(timezone=True))

    # Additional metrics
    attempts = Column(Integer, default=1)  # Multi-attempt support
    hints_used = Column(Integer, default=0)
    user_feedback = Column(Text)  # Optional qualitative feedback

    reviewed_at = Column(DateTime(timezone=True),
                         default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="reviews")
    micro_card = relationship("MicroCard", back_populates="reviews")

    __table_args__ = (
        Index(
            'ix_reviews_next_review', 'next_review_date'),
        Index(
            'ix_reviews_user_card', 'user_id', 'micro_card_id'),
        UniqueConstraint(
            'user_id',
            'micro_card_id',
            'reviewed_at',
            name='uq_user_card_review'
        ),
    )

    def __repr__(self):
        return f"<Review(user_id={self.user_id}, result={self.result.value})>"


class XPTransaction(Base):
    """
    Experience point tracking for gamification
    Records all XP-earning events with detailed context
    """
    __tablename__ = "xp_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(
            as_uuid=True),
        ForeignKey("users.id"),
        nullable=False)

    # Transaction details
    event_type = Column(Enum(XPEventType), nullable=False)
    points = Column(Integer, nullable=False)
    description = Column(String(200))

    # Context metadata
    source_id = Column(UUID(as_uuid=True))  # Related card/review ID
    multiplier = Column(Float, default=1.0)  # Bonus multipliers
    extra_data = Column(JSON)  # Additional event context

    created_at = Column(
        DateTime(
            timezone=True), default=lambda: datetime.now(
            timezone.utc))

    # Relationships
    user = relationship("User", back_populates="xp_transactions")

    __table_args__ = (
        Index('ix_xp_transactions_user_date', 'user_id', 'created_at'),
        Index('ix_xp_transactions_event_type', 'event_type'),
    )

    def __repr__(self):
        return f"<XPTransaction(user_id={
            self.user_id}, points={
            self.points}, type={
            self.event_type.value})>"


# Association table for many-to-many relationship between users and peer rooms

user_peer_rooms = Table(
    'user_peer_rooms',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'),
           primary_key=True),
    Column('peer_room_id', UUID(as_uuid=True), ForeignKey('peer_rooms.id'),
           primary_key=True),
    Column('joined_at', DateTime(timezone=True),
           default=lambda: datetime.now(timezone.utc)),
    Column('role', String(20), default='participant')
)


class PeerRoom(Base):
    """
    Real-time peer study rooms and Q&A sessions
    Supports collaborative learning and knowledge sharing
    """
    __tablename__ = "peer_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    host_id = Column(
        UUID(
            as_uuid=True),
        ForeignKey("users.id"),
        nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"))

    # Room configuration
    name = Column(String(100), nullable=False)
    description = Column(Text)
    max_participants = Column(Integer, default=10)
    is_public = Column(Boolean, default=True)

    # Session metadata
    is_active = Column(Boolean, default=True)
    started_at = Column(
        DateTime(
            timezone=True), default=lambda: datetime.now(
            timezone.utc))
    ended_at = Column(DateTime(timezone=True))

    # Feature flags
    allow_voice = Column(Boolean, default=False)
    allow_screen_share = Column(Boolean, default=False)
    moderated = Column(Boolean, default=False)

    created_at = Column(
        DateTime(
            timezone=True), default=lambda: datetime.now(
            timezone.utc))

    # Relationships
    host = relationship("User", foreign_keys=[host_id])
    skill = relationship("Skill")
    participants = relationship(
        "User",
        secondary=user_peer_rooms,
        back_populates="peer_rooms")

    __table_args__ = (
        Index('ix_peer_rooms_active', 'is_active', 'is_public'),
        Index('ix_peer_rooms_skill', 'skill_id'),
    )

    @property
    def participant_count(self) -> int:
        """Get current number of participants"""
        return len(self.participants)

    def __repr__(self):
        return f"<PeerRoom(name='{
            self.name}', participants={
            self.participant_count})>"


# Database indexes for performance optimization
def create_performance_indexes():
    """
    Additional database indexes for query optimization
    Should be run after table creation
    """
    # Composite indexes for common query patterns
    Index('ix_reviews_user_due', Review.user_id, Review.next_review_date)
    Index('ix_cards_skill_difficulty', MicroCard.skill_id,
          MicroCard.difficulty_level)
