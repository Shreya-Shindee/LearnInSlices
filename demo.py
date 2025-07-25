#!/usr/bin/env python3
"""
🚀 LearnInSlices - Quick Demo Script
Demonstrates the Stage 1 implementation with live examples
"""

import sys
import os
from datetime import datetime, timezone, timedelta

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.models import (
    User, Skill, MicroCard, Review, XPTransaction,
    DifficultyLevel, CardType, ReviewResult, XPEventType
)
from app.spacedrep import SpacedRepetitionEngine, SchedulingAlgorithm
import uuid


def demo_microlearning_flow():
    """Demonstrate a complete microlearning flow"""
    print("🧠 LearnInSlices - Adaptive Microlearning Platform Demo")
    print("=" * 60)
    
    print("\n📚 1. Creating Learning Content...")
    
    # Create a learner
    learner = User(
        email="alice@example.com",
        username="alice_learns",
        hashed_password="secure_hash_123",
        full_name="Alice Johnson",
        daily_goal_minutes=20,
        learning_streak=5,
        is_active=True
    )
    print(f"✓ Created learner: {learner.full_name} ({learner.email})")
    print(f"  - Daily goal: {learner.daily_goal_minutes} minutes")
    print(f"  - Current streak: {learner.learning_streak} days")
    
    # Create a skill
    python_skill = Skill(
        name="Python Programming",
        slug="python-programming",
        description="Master Python programming fundamentals",
        difficulty_level=DifficultyLevel.BEGINNER,
        estimated_hours=40.0,
        tags=["programming", "python", "coding", "backend"],
        level=0
    )
    print(f"\n✓ Created skill: {python_skill.name}")
    print(f"  - Difficulty: {python_skill.difficulty_level.value}")
    print(f"  - Estimated time: {python_skill.estimated_hours} hours")
    print(f"  - Tags: {', '.join(python_skill.tags)}")
    
    # Create micro-cards
    cards = [
        MicroCard(
            skill_id=python_skill.id,
            title="Python Variables and Data Types",
            content_type=CardType.CONCEPT,
            content={
                "text": "Variables in Python store data values. Python has dynamic typing, meaning you don't need to declare variable types explicitly.",
                "examples": [
                    "x = 5  # Integer",
                    "name = 'Alice'  # String",
                    "pi = 3.14159  # Float", 
                    "is_valid = True  # Boolean"
                ],
                "key_points": [
                    "Variables are created when you assign a value",
                    "Python determines the type automatically", 
                    "Variable names should be descriptive"
                ]
            },
            difficulty_level=DifficultyLevel.BEGINNER,
            estimated_time_minutes=3,
            ease_factor=2.5,
            interval_days=1,
            repetitions=0
        ),
        MicroCard(
            skill_id=python_skill.id,
            title="Python Control Structures Quiz",
            content_type=CardType.QUIZ,
            content={
                "question": "Which Python keyword is used to create a conditional statement?",
                "options": ["for", "if", "while", "def"],
                "correct_answer": "if",
                "explanation": "The 'if' keyword is used to create conditional statements in Python, allowing code to execute only when certain conditions are met."
            },
            difficulty_level=DifficultyLevel.BEGINNER,
            estimated_time_minutes=2,
            ease_factor=2.5,
            interval_days=1,
            repetitions=0
        )
    ]
    
    print(f"\n✓ Created {len(cards)} micro-cards:")
    for i, card in enumerate(cards, 1):
        print(f"  {i}. {card.title} ({card.content_type.value})")
        print(f"     - Time: {card.estimated_time_minutes} min")
    
    print("\n🧠 2. Spaced Repetition in Action...")
    
    # Initialize spaced repetition engine
    sr_engine = SpacedRepetitionEngine(algorithm=SchedulingAlgorithm.SM2)
    print(f"✓ Initialized {sr_engine.algorithm.value.upper()} spaced repetition engine")
    
    # Simulate learning sessions
    print("\n📈 Simulating Learning Sessions:")
    
    for session_day in range(1, 4):
        print(f"\n--- Day {session_day} Learning Session ---")
        
        for card in cards:
            # Simulate different performance levels
            if session_day == 1:
                result = ReviewResult.GOOD
                confidence = 3
            elif session_day == 2:
                result = ReviewResult.EASY if card.title.startswith("Python Variables") else ReviewResult.HARD
                confidence = 4 if result == ReviewResult.EASY else 2
            else:
                result = ReviewResult.EASY
                confidence = 5
            
            # Calculate next review schedule
            schedule = sr_engine.calculate_next_review(
                card, result, confidence_level=confidence
            )
            
            # Create review record
            review = Review(
                user_id=learner.id,
                micro_card_id=card.id,
                result=result,
                confidence_level=confidence,
                time_spent_seconds=card.estimated_time_minutes * 60,
                previous_ease_factor=card.ease_factor,
                new_ease_factor=schedule.ease_factor,
                previous_interval_days=card.interval_days,
                new_interval_days=schedule.interval_days,
                next_review_date=schedule.next_review_date,
                attempts=1
            )
            
            # Update card parameters
            card.ease_factor = schedule.ease_factor
            card.interval_days = schedule.interval_days
            card.repetitions = schedule.repetitions
            
            print(f"📝 {card.title[:30]}...")
            print(f"   Result: {result.value} (confidence: {confidence}/5)")
            print(f"   Next review: {schedule.interval_days} days")
            print(f"   Ease factor: {schedule.ease_factor:.2f}")
            
            # Award XP
            xp_points = {
                ReviewResult.AGAIN: 10,
                ReviewResult.HARD: 20,
                ReviewResult.GOOD: 30,
                ReviewResult.EASY: 50
            }[result]
            
            xp = XPTransaction(
                user_id=learner.id,
                event_type=XPEventType.CARD_COMPLETED,
                points=xp_points,
                description=f"Completed {card.content_type.value} card",
                source_id=card.id,
                multiplier=1.0 + (confidence - 3) * 0.1  # Confidence bonus
            )
            print(f"   XP earned: {int(xp.points * xp.multiplier)} points")
    
    print("\n🎮 3. Gamification Summary...")
    
    # Calculate total XP (simulated)
    total_xp = 0
    sessions_completed = 6  # 3 days × 2 cards
    
    for session in range(sessions_completed):
        base_xp = 30 + (session * 5)  # Increasing performance
        total_xp += base_xp
    
    print(f"✓ Total XP earned: {total_xp} points")
    print(f"✓ Learning streak: {learner.learning_streak} days")
    print(f"✓ Cards mastered: {len([c for c in cards if c.repetitions >= 2])}")
    print(f"✓ Average ease factor: {sum(c.ease_factor for c in cards) / len(cards):.2f}")
    
    print("\n📊 4. Algorithm Comparison...")
    
    # Compare SM2 vs Leitner for same scenario
    test_card = MicroCard(
        skill_id=python_skill.id,
        title="Test Card",
        content_type=CardType.CONCEPT,
        content={
            "text": "Test content for algorithm comparison",
            "examples": ["example1", "example2"]
        },
        difficulty_level=DifficultyLevel.BEGINNER,
        ease_factor=2.5,
        interval_days=1,
        repetitions=0
    )
    
    sm2_engine = SpacedRepetitionEngine(SchedulingAlgorithm.SM2)
    leitner_engine = SpacedRepetitionEngine(SchedulingAlgorithm.LEITNER)
    
    print("\nSame review (GOOD, confidence=4) with different algorithms:")
    
    sm2_schedule = sm2_engine.calculate_next_review(test_card, ReviewResult.GOOD, 4)
    leitner_schedule = leitner_engine.calculate_next_review(test_card, ReviewResult.GOOD, 4)
    
    print(f"SM2:     Next review in {sm2_schedule.interval_days} days (ease: {sm2_schedule.ease_factor:.2f})")
    print(f"Leitner: Next review in {leitner_schedule.interval_days} days (box: {leitner_schedule.metadata.get('leitner_box', 'N/A')})")
    
    print("\n🎯 5. Performance Analytics...")
    
    # Simulate some review history for retention calculation
    from datetime import datetime, timezone, timedelta
    
    class MockReview:
        def __init__(self, days_ago, result):
            self.reviewed_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
            self.result = result
    
    mock_reviews = [
        MockReview(1, ReviewResult.GOOD),
        MockReview(3, ReviewResult.EASY),
        MockReview(5, ReviewResult.GOOD),
        MockReview(7, ReviewResult.HARD),
        MockReview(10, ReviewResult.GOOD),
        MockReview(12, ReviewResult.EASY),
        MockReview(15, ReviewResult.AGAIN),
        MockReview(18, ReviewResult.GOOD)
    ]
    
    retention_rate = sr_engine.calculate_retention_rate(mock_reviews, 30)
    
    print(f"✓ 30-day retention rate: {retention_rate:.1%}")
    print(f"✓ Reviews completed: {len(mock_reviews)}")
    print(f"✓ Success rate: {len([r for r in mock_reviews if r.result in [ReviewResult.GOOD, ReviewResult.EASY]])}/{len(mock_reviews)}")
    
    # Daily load optimization
    load_config = sr_engine.optimize_daily_load(
        user_id=str(learner.id),
        target_minutes=learner.daily_goal_minutes
    )
    
    print(f"\n📅 Optimized daily schedule for {learner.daily_goal_minutes} minutes:")
    print(f"  - Review cards: {load_config['recommended_reviews']}")
    print(f"  - New cards: {load_config['recommended_new_cards']}")
    print(f"  - Time range: {load_config['confidence_interval'][0]:.0f}-{load_config['confidence_interval'][1]:.0f} minutes")
    
    print("\n🎉 Demo Complete!")
    print("=" * 60)
    print("✅ Stage 1 implementation successfully demonstrated:")
    print("   • Core data models with relationships")
    print("   • SM2 and Leitner spaced repetition algorithms") 
    print("   • Confidence-based scheduling adjustments")
    print("   • Performance analytics and optimization")
    print("   • Gamification with XP and streak tracking")
    print("\n🚀 Ready for Stage 2: OER Crawler & Content Generation!")


if __name__ == "__main__":
    try:
        demo_microlearning_flow()
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
