"""
Unit Tests for Core Data Models
Tests SQLAlchemy models, relationships, and validation logic
"""

import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.models import (
    Base, User, Skill, MicroCard, Review, XPTransaction, PeerRoom,
    DifficultyLevel, CardType, ReviewResult, XPEventType
)


# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass_123",
        full_name="Test User",
        daily_goal_minutes=20
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_skill(db_session):
    """Create a sample skill for testing"""
    skill = Skill(
        name="Python Programming",
        slug="python-programming",
        description="Learn Python programming fundamentals",
        difficulty_level=DifficultyLevel.BEGINNER,
        estimated_hours=40.0,
        tags=["programming", "python", "coding"]
    )
    db_session.add(skill)
    db_session.commit()
    db_session.refresh(skill)
    return skill


@pytest.fixture
def sample_micro_card(db_session, sample_skill):
    """Create a sample micro card for testing"""
    card = MicroCard(
        skill_id=sample_skill.id,
        title="Python Variables and Data Types",
        content_type=CardType.CONCEPT,
        content={
            "text": "Variables store data values in Python",
            "examples": ["x = 5", "name = 'Alice'", "is_valid = True"]
        },
        difficulty_level=DifficultyLevel.BEGINNER,
        estimated_time_minutes=3
    )
    db_session.add(card)
    db_session.commit()
    db_session.refresh(card)
    return card


class TestUserModel:
    """Test User model functionality"""
    
    def test_user_creation(self, db_session):
        """Test basic user creation and validation"""
        user = User(
            email="user@test.com",
            username="testuser123",
            hashed_password="secure_hash",
            full_name="John Doe"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.email == "user@test.com"
        assert user.learning_streak == 0
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_user_email_validation(self, db_session):
        """Test email validation logic"""
        user = User(
            email="UPPERCASE@EXAMPLE.COM",
            username="testuser",
            hashed_password="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        # Email should be converted to lowercase
        assert user.email == "uppercase@example.com"
    
    def test_user_email_uniqueness(self, db_session, sample_user):
        """Test email uniqueness constraint"""
        duplicate_user = User(
            email=sample_user.email,
            username="different_username",
            hashed_password="hash"
        )
        db_session.add(duplicate_user)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_total_xp_property(self, db_session, sample_user):
        """Test XP calculation property"""
        # Add some XP transactions
        xp1 = XPTransaction(
            user_id=sample_user.id,
            event_type=XPEventType.CARD_COMPLETED,
            points=50,
            description="Completed concept card"
        )
        xp2 = XPTransaction(
            user_id=sample_user.id,
            event_type=XPEventType.REVIEW_SUCCESS,
            points=25,
            description="Successful review"
        )
        
        db_session.add_all([xp1, xp2])
        db_session.commit()
        db_session.refresh(sample_user)
        
        assert sample_user.total_xp == 75


class TestSkillModel:
    """Test Skill model functionality"""
    
    def test_skill_creation(self, db_session):
        """Test basic skill creation"""
        skill = Skill(
            name="Machine Learning",
            slug="machine-learning",
            description="Introduction to ML concepts",
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            tags=["ml", "ai", "data-science"]
        )
        db_session.add(skill)
        db_session.commit()
        
        assert skill.id is not None
        assert skill.name == "Machine Learning"
        assert skill.level == 0  # Default root level
        assert skill.created_at is not None
    
    def test_skill_hierarchy(self, db_session):
        """Test parent-child skill relationships"""
        parent_skill = Skill(
            name="Programming",
            slug="programming",
            level=0
        )
        db_session.add(parent_skill)
        db_session.commit()
        
        child_skill = Skill(
            name="Python",
            slug="python",
            parent_id=parent_skill.id,
            level=1
        )
        db_session.add(child_skill)
        db_session.commit()
        
        assert child_skill.parent_id == parent_skill.id
        assert len(parent_skill.children) == 1
        assert parent_skill.children[0].name == "Python"


class TestMicroCardModel:
    """Test MicroCard model functionality"""
    
    def test_micro_card_creation(self, db_session, sample_skill):
        """Test basic micro card creation"""
        card = MicroCard(
            skill_id=sample_skill.id,
            title="Test Card",
            content_type=CardType.QUIZ,
            content={
                "question": "What is Python?",
                "options": ["A snake", "A programming language", "A tool"],
                "correct_answer": "A programming language"
            },
            difficulty_level=DifficultyLevel.BEGINNER
        )
        db_session.add(card)
        db_session.commit()
        
        assert card.id is not None
        assert card.ease_factor == 2.5  # Default SM2 ease
        assert card.interval_days == 1  # Default interval
        assert card.is_active is True
    
    def test_content_validation_quiz(self, db_session, sample_skill):
        """Test quiz content validation"""
        # Valid quiz content
        valid_quiz = MicroCard(
            skill_id=sample_skill.id,
            title="Valid Quiz",
            content_type=CardType.QUIZ,
            content={
                "question": "What is 2+2?",
                "options": ["3", "4", "5"],
                "correct_answer": "4"
            },
            difficulty_level=DifficultyLevel.BEGINNER
        )
        db_session.add(valid_quiz)
        db_session.commit()  # Should not raise
        
        assert valid_quiz.id is not None
    
    def test_micro_card_skill_relationship(self, db_session, sample_micro_card):
        """Test relationship between cards and skills"""
        assert sample_micro_card.skill is not None
        assert sample_micro_card.skill.name == "Python Programming"
        assert len(sample_micro_card.skill.micro_cards) == 1


class TestReviewModel:
    """Test Review model functionality"""
    
    def test_review_creation(self, db_session, sample_user, sample_micro_card):
        """Test basic review creation"""
        review = Review(
            user_id=sample_user.id,
            micro_card_id=sample_micro_card.id,
            result=ReviewResult.GOOD,
            confidence_level=4,
            time_spent_seconds=120,
            previous_ease_factor=2.5,
            new_ease_factor=2.6,
            previous_interval_days=1,
            new_interval_days=6,
            next_review_date=datetime.now(timezone.utc) + timedelta(days=6)
        )
        db_session.add(review)
        db_session.commit()
        
        assert review.id is not None
        assert review.attempts == 1  # Default
        assert review.reviewed_at is not None
    
    def test_review_relationships(self, db_session, sample_user, sample_micro_card):
        """Test review model relationships"""
        review = Review(
            user_id=sample_user.id,
            micro_card_id=sample_micro_card.id,
            result=ReviewResult.EASY,
            confidence_level=5,
            time_spent_seconds=90,
            new_ease_factor=2.7,
            new_interval_days=14,
            next_review_date=datetime.now(timezone.utc) + timedelta(days=14)
        )
        db_session.add(review)
        db_session.commit()
        
        assert review.user.username == sample_user.username
        assert review.micro_card.title == sample_micro_card.title


class TestXPTransactionModel:
    """Test XP transaction model"""
    
    def test_xp_transaction_creation(self, db_session, sample_user):
        """Test XP transaction creation"""
        xp = XPTransaction(
            user_id=sample_user.id,
            event_type=XPEventType.STREAK_MILESTONE,
            points=100,
            description="7-day learning streak",
            multiplier=1.5,
            metadata={"streak_days": 7, "bonus": "weekly"}
        )
        db_session.add(xp)
        db_session.commit()
        
        assert xp.id is not None
        assert xp.points == 100
        assert xp.multiplier == 1.5
        assert xp.metadata["streak_days"] == 7


class TestPeerRoomModel:
    """Test peer room model"""
    
    def test_peer_room_creation(self, db_session, sample_user, sample_skill):
        """Test peer room creation"""
        room = PeerRoom(
            host_id=sample_user.id,
            skill_id=sample_skill.id,
            name="Python Study Group",
            description="Learn Python together",
            max_participants=5,
            is_public=True
        )
        db_session.add(room)
        db_session.commit()
        
        assert room.id is not None
        assert room.is_active is True
        assert room.participant_count == 0  # No participants yet
    
    def test_peer_room_participants(self, db_session, sample_user, sample_skill):
        """Test peer room participant relationships"""
        room = PeerRoom(
            host_id=sample_user.id,
            skill_id=sample_skill.id,
            name="Test Room",
            max_participants=3
        )
        
        # Add participant
        room.participants.append(sample_user)
        db_session.add(room)
        db_session.commit()
        
        assert room.participant_count == 1
        assert sample_user in room.participants


# Integration tests
class TestModelIntegration:
    """Test model integration scenarios"""
    
    def test_complete_learning_flow(self, db_session, sample_user, sample_skill):
        """Test a complete learning scenario"""
        # Create micro card
        card = MicroCard(
            skill_id=sample_skill.id,
            title="Variables in Python",
            content_type=CardType.CONCEPT,
            content={"text": "Variables store values", "examples": ["x = 5"]},
            difficulty_level=DifficultyLevel.BEGINNER
        )
        db_session.add(card)
        db_session.flush()
        
        # User reviews the card
        review = Review(
            user_id=sample_user.id,
            micro_card_id=card.id,
            result=ReviewResult.GOOD,
            confidence_level=4,
            time_spent_seconds=180,
            new_ease_factor=2.6,
            new_interval_days=6,
            next_review_date=datetime.now(timezone.utc) + timedelta(days=6)
        )
        db_session.add(review)
        db_session.flush()
        
        # Award XP
        xp = XPTransaction(
            user_id=sample_user.id,
            event_type=XPEventType.CARD_COMPLETED,
            points=50,
            source_id=card.id,
            description="Completed concept card"
        )
        db_session.add(xp)
        db_session.commit()
        
        # Verify the complete flow
        db_session.refresh(sample_user)
        assert len(sample_user.reviews) == 1
        assert len(sample_user.xp_transactions) == 1
        assert sample_user.total_xp == 50
        assert card.reviews[0].result == ReviewResult.GOOD
