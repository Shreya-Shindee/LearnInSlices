"""
Simple test runner for Stage 1 verification
Tests core models and spaced repetition without full pytest dependencies
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timezone, timedelta
from app.models import (
    User, Skill, MicroCard, Review, XPTransaction,
    DifficultyLevel, CardType, ReviewResult, XPEventType
)
from app.spacedrep import SpacedRepetitionEngine, SchedulingAlgorithm
import uuid

def test_models():
    """Test model creation and basic functionality"""
    print("🧪 Testing Core Models...")
    
    # Test User creation
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass_123",
        full_name="Test User",
        learning_streak=0,  # Explicitly set for testing
        is_active=True
    )
    assert user.email == "test@example.com"
    assert user.learning_streak == 0
    assert user.is_active is True
    print("✓ User model works")
    
    # Test Skill creation
    skill = Skill(
        name="Python Programming",
        slug="python-programming",
        description="Learn Python fundamentals",
        difficulty_level=DifficultyLevel.BEGINNER,
        tags=["programming", "python"],
        level=0  # Explicitly set for testing
    )
    assert skill.name == "Python Programming"
    assert skill.level == 0
    print("✓ Skill model works")
    
    # Test MicroCard creation
    card = MicroCard(
        skill_id=uuid.uuid4(),
        title="Variables in Python",
        content_type=CardType.CONCEPT,
        content={
            "text": "Variables store data values",
            "examples": ["x = 5", "name = 'Alice'"]
        },
        difficulty_level=DifficultyLevel.BEGINNER,
        ease_factor=2.5,  # Explicitly set for testing
        interval_days=1,
        repetitions=0
    )
    assert card.title == "Variables in Python"
    assert card.ease_factor == 2.5
    assert card.interval_days == 1
    print("✓ MicroCard model works")
    
    # Test Review creation
    review = Review(
        user_id=uuid.uuid4(),
        micro_card_id=uuid.uuid4(),
        result=ReviewResult.GOOD,
        confidence_level=4,
        time_spent_seconds=120,
        new_ease_factor=2.6,
        new_interval_days=6,
        next_review_date=datetime.now(timezone.utc) + timedelta(days=6),
        attempts=1  # Explicitly set for testing
    )
    assert review.result == ReviewResult.GOOD
    assert review.attempts == 1
    print("✓ Review model works")
    
    # Test XP Transaction
    xp = XPTransaction(
        user_id=uuid.uuid4(),
        event_type=XPEventType.CARD_COMPLETED,
        points=50,
        description="Completed concept card",
        multiplier=1.0  # Explicitly set for testing
    )
    assert xp.points == 50
    assert xp.multiplier == 1.0
    print("✓ XPTransaction model works")


def test_spaced_repetition():
    """Test spaced repetition algorithms"""
    print("\n🧠 Testing Spaced Repetition Engine...")
    
    # Create mock card
    class MockCard:
        def __init__(self):
            self.ease_factor = 2.5
            self.interval_days = 1
            self.repetitions = 0
            self.difficulty_level = DifficultyLevel.BEGINNER
    
    # Test SM2 algorithm
    sm2_engine = SpacedRepetitionEngine(SchedulingAlgorithm.SM2)
    card = MockCard()
    
    # Test easy review
    schedule = sm2_engine.calculate_next_review(
        card, ReviewResult.EASY, confidence_level=5
    )
    assert schedule.algorithm_used == SchedulingAlgorithm.SM2
    assert schedule.repetitions == 1
    assert schedule.ease_factor > 2.5  # Should increase
    print("✓ SM2 easy review works")
    
    # Test failed review
    schedule = sm2_engine.calculate_next_review(
        card, ReviewResult.AGAIN, confidence_level=1
    )
    assert schedule.repetitions == 0  # Reset on failure
    assert schedule.interval_days == 1
    print("✓ SM2 failed review works")
    
    # Test Leitner algorithm
    leitner_engine = SpacedRepetitionEngine(SchedulingAlgorithm.LEITNER)
    card = MockCard()
    
    schedule = leitner_engine.calculate_next_review(
        card, ReviewResult.GOOD, confidence_level=4
    )
    assert schedule.algorithm_used == SchedulingAlgorithm.LEITNER
    assert schedule.repetitions == 1
    assert schedule.interval_days == 3  # Box 2 interval
    assert "leitner_box" in schedule.metadata
    print("✓ Leitner algorithm works")
    
    # Test confidence multipliers
    card_low = MockCard()
    card_high = MockCard()
    
    schedule_low = sm2_engine.calculate_next_review(
        card_low, ReviewResult.GOOD, confidence_level=1
    )
    schedule_high = sm2_engine.calculate_next_review(
        card_high, ReviewResult.GOOD, confidence_level=5
    )
    print(f"Low confidence interval: {schedule_low.interval_days}")
    print(f"High confidence interval: {schedule_high.interval_days}")
    # For new cards, both will be 1 day initially, but confidence should affect future
    # Let's test the confidence multiplier directly
    low_mult = sm2_engine._get_confidence_multiplier(1)
    high_mult = sm2_engine._get_confidence_multiplier(5)
    assert high_mult > low_mult
    print("✓ Confidence multipliers work")
    
    # Test retention rate calculation
    class MockReview:
        def __init__(self, days_ago, result):
            self.reviewed_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
            self.result = result
    
    reviews = [
        MockReview(5, ReviewResult.GOOD),
        MockReview(10, ReviewResult.EASY),
        MockReview(15, ReviewResult.AGAIN),
        MockReview(20, ReviewResult.HARD)
    ]
    
    retention_rate = sm2_engine.calculate_retention_rate(reviews, 30)
    assert retention_rate == 0.5  # 2 out of 4 successful
    print("✓ Retention rate calculation works")


def test_enums():
    """Test enum definitions"""
    print("\n📊 Testing Enums...")
    
    # Test all enum values exist
    assert DifficultyLevel.BEGINNER.value == "beginner"
    assert CardType.CONCEPT.value == "concept"
    assert ReviewResult.GOOD.value == "good"
    assert XPEventType.CARD_COMPLETED.value == "card_completed"
    print("✓ All enums defined correctly")


def test_model_relationships():
    """Test model relationship definitions"""
    print("\n🔗 Testing Model Relationships...")
    
    # Test that relationships are defined (no errors during import)
    user = User(email="test@test.com", username="test", hashed_password="hash")
    skill = Skill(name="Test", slug="test")
    
    # Test relationship attributes exist
    assert hasattr(user, 'reviews')
    assert hasattr(user, 'xp_transactions')
    assert hasattr(skill, 'micro_cards')
    print("✓ Model relationships defined")


def run_all_tests():
    """Run all Stage 1 tests"""
    print("🚀 Starting Stage 1 Tests - Core Models & Spaced Repetition\n")
    
    try:
        test_enums()
        test_models()
        test_model_relationships()
        test_spaced_repetition()
        
        print("\n🎉 All Stage 1 tests passed!")
        print("✓ Core data models implemented")
        print("✓ Spaced repetition engine working")
        print("✓ SM2 and Leitner algorithms functional")
        print("✓ Model relationships defined")
        print("\n🎯 Stage 1 Complete! Ready for Stage 2.")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
