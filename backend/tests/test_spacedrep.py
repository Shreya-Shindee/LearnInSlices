"""
Unit Tests for Spaced Repetition Engine
Tests SM2 and Leitner algorithms, review scheduling, and session management
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch

from app.spacedrep import (
    SpacedRepetitionEngine, ReviewSessionManager, ReviewSchedule,
    SchedulingAlgorithm
)
from app.models import MicroCard, Review, ReviewResult, CardType, DifficultyLevel


@pytest.fixture
def sm2_engine():
    """Create SM2 spaced repetition engine"""
    return SpacedRepetitionEngine(algorithm=SchedulingAlgorithm.SM2)


@pytest.fixture
def leitner_engine():
    """Create Leitner spaced repetition engine"""
    return SpacedRepetitionEngine(algorithm=SchedulingAlgorithm.LEITNER)


@pytest.fixture
def sample_micro_card():
    """Create a sample micro card for testing"""
    card = Mock(spec=MicroCard)
    card.ease_factor = 2.5
    card.interval_days = 1
    card.repetitions = 0
    card.difficulty_level = DifficultyLevel.BEGINNER
    card.estimated_time_minutes = 5
    return card


@pytest.fixture
def experienced_card():
    """Create a card that has been reviewed multiple times"""
    card = Mock(spec=MicroCard)
    card.ease_factor = 2.8
    card.interval_days = 14
    card.repetitions = 3
    card.difficulty_level = DifficultyLevel.INTERMEDIATE
    return card


class TestSM2Algorithm:
    """Test SM2 algorithm implementation"""

    def test_new_card_easy_review(self, sm2_engine, sample_micro_card):
        """Test SM2 scheduling for new card with easy review"""
        schedule = sm2_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.EASY,
            confidence_level=5
        )

        assert isinstance(schedule, ReviewSchedule)
        assert schedule.algorithm_used == SchedulingAlgorithm.SM2
        assert schedule.repetitions == 1
        assert schedule.interval_days == 1  # First review always 1 day
        assert schedule.ease_factor > 2.5  # Should increase for easy
        assert schedule.confidence_score == 1.0

    def test_new_card_failed_review(self, sm2_engine, sample_micro_card):
        """Test SM2 scheduling for failed review"""
        schedule = sm2_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.AGAIN,
            confidence_level=1
        )

        assert schedule.repetitions == 0  # Reset on failure
        assert schedule.interval_days == 1  # Back to 1 day
        assert schedule.ease_factor < 2.5  # Should decrease for failure

    def test_second_review_good(self, sm2_engine, sample_micro_card):
        """Test second review with good result"""
        # Simulate first review
        sample_micro_card.repetitions = 1
        sample_micro_card.interval_days = 1

        schedule = sm2_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.GOOD,
            confidence_level=3
        )

        assert schedule.repetitions == 2
        assert schedule.interval_days == 6  # Second review = 6 days

    def test_experienced_card_review(self, sm2_engine, experienced_card):
        """Test review of card with multiple successful reviews"""
        schedule = sm2_engine.calculate_next_review(
            experienced_card,
            ReviewResult.GOOD,
            confidence_level=4
        )

        assert schedule.repetitions == 4
        # Should be previous_interval * ease_factor * confidence_multiplier
        expected_base = int(14 * 2.8)  # 39 days base
        expected_with_confidence = int(expected_base * 1.2)  # Confidence boost
        assert schedule.interval_days == expected_with_confidence

    def test_confidence_multiplier_effect(self, sm2_engine, sample_micro_card):
        """Test how confidence level affects scheduling"""
        # Low confidence
        schedule_low = sm2_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.GOOD,
            confidence_level=1
        )

        # High confidence
        schedule_high = sm2_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.GOOD,
            confidence_level=5
        )

        assert schedule_high.interval_days > schedule_low.interval_days
        assert schedule_high.confidence_score > schedule_low.confidence_score

    def test_ease_factor_bounds(self, sm2_engine, sample_micro_card):
        """Test that ease factor stays within bounds"""
        # Test multiple failures to check minimum
        for _ in range(5):
            schedule = sm2_engine.calculate_next_review(
                sample_micro_card,
                ReviewResult.AGAIN,
                confidence_level=1
            )
            sample_micro_card.ease_factor = schedule.ease_factor

        assert schedule.ease_factor >= sm2_engine.MIN_EASE_FACTOR

        # Test multiple successes to check maximum
        sample_micro_card.ease_factor = 3.8
        for _ in range(5):
            schedule = sm2_engine.calculate_next_review(
                sample_micro_card,
                ReviewResult.EASY,
                confidence_level=5
            )
            sample_micro_card.ease_factor = schedule.ease_factor

        assert schedule.ease_factor <= sm2_engine.MAX_EASE_FACTOR


class TestLeitnerAlgorithm:
    """Test Leitner box system implementation"""

    def test_new_card_success(self, leitner_engine, sample_micro_card):
        """Test Leitner scheduling for new card success"""
        schedule = leitner_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.GOOD,
            confidence_level=4
        )

        assert schedule.algorithm_used == SchedulingAlgorithm.LEITNER
        assert schedule.repetitions == 1
        assert schedule.interval_days == 3  # Box 2 interval
        assert "leitner_box" in schedule.metadata
        assert schedule.metadata["leitner_box"] == 2

    def test_card_failure_regression(self, leitner_engine, experienced_card):
        """Test card moving back on failure"""
        schedule = leitner_engine.calculate_next_review(
            experienced_card,
            ReviewResult.AGAIN,
            confidence_level=1
        )

        assert schedule.repetitions == 0  # Back to start
        assert schedule.interval_days == 1  # Box 1 interval
        assert schedule.metadata["leitner_box"] == 1

    def test_hard_review_stays_in_box(self, leitner_engine, experienced_card):
        """Test hard review keeps card in current box"""
        original_reps = experienced_card.repetitions

        schedule = leitner_engine.calculate_next_review(
            experienced_card,
            ReviewResult.HARD,
            confidence_level=2
        )

        # Should move back one box or stay
        assert schedule.repetitions <= original_reps
        assert schedule.interval_days >= 1

    def test_easy_confidence_bonus(self, leitner_engine, sample_micro_card):
        """Test confidence bonus for easy reviews"""
        schedule_normal = leitner_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.EASY,
            confidence_level=3
        )

        schedule_confident = leitner_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.EASY,
            confidence_level=5
        )

        # High confidence should get bonus interval
        assert schedule_confident.interval_days > schedule_normal.interval_days
        assert schedule_confident.metadata["confidence_bonus"] is True

    def test_box_progression_limits(self, leitner_engine, sample_micro_card):
        """Test that cards don't exceed maximum box"""
        # Simulate card progressing through all boxes
        sample_micro_card.repetitions = 10  # Beyond max boxes

        schedule = leitner_engine.calculate_next_review(
            sample_micro_card,
            ReviewResult.GOOD,
            confidence_level=4
        )

        max_box = len(leitner_engine.LEITNER_INTERVALS)
        assert schedule.metadata["leitner_box"] <= max_box
        assert schedule.interval_days == leitner_engine.LEITNER_INTERVALS[-1]


class TestSpacedRepetitionEngine:
    """Test general engine functionality"""

    def test_unsupported_algorithm(self):
        """Test error handling for unsupported algorithm"""
        with pytest.raises(ValueError, match="Unsupported algorithm"):
            engine = SpacedRepetitionEngine()
            engine.algorithm = "unsupported"
            engine.calculate_next_review(
                Mock(), ReviewResult.GOOD, confidence_level=3
            )

    def test_quality_score_mapping(self, sm2_engine):
        """Test mapping of review results to quality scores"""
        # Test direct mapping
        quality_again = sm2_engine._map_result_to_quality(
            ReviewResult.AGAIN, 3
        )
        assert quality_again == 0

        quality_easy = sm2_engine._map_result_to_quality(
            ReviewResult.EASY, 5
        )
        assert quality_easy == 5

        # Test confidence adjustments
        quality_good_confident = sm2_engine._map_result_to_quality(
            ReviewResult.GOOD, 5
        )
        assert quality_good_confident == 4  # Promoted to easy

        quality_hard_uncertain = sm2_engine._map_result_to_quality(
            ReviewResult.HARD, 1
        )
        assert quality_hard_uncertain == 1  # Demoted

    def test_confidence_multiplier_ranges(self, sm2_engine):
        """Test confidence multiplier calculation"""
        # Test all confidence levels
        multipliers = [
            sm2_engine._get_confidence_multiplier(i) for i in range(1, 6)
        ]

        # Should be ascending
        assert multipliers == sorted(multipliers)
        assert multipliers[0] < 1.0  # Very uncertain shortens interval
        assert multipliers[-1] > 1.0  # Very confident extends interval
        assert multipliers[2] == 1.0  # Neutral is baseline

    def test_retention_rate_calculation(self, sm2_engine):
        """Test retention rate calculation"""
        # Create mock reviews
        now = datetime.now(timezone.utc)
        reviews = [
            Mock(
                reviewed_at=now - timedelta(days=5),
                result=ReviewResult.GOOD
            ),
            Mock(
                reviewed_at=now - timedelta(days=10),
                result=ReviewResult.EASY
            ),
            Mock(
                reviewed_at=now - timedelta(days=15),
                result=ReviewResult.AGAIN
            ),
            Mock(
                reviewed_at=now - timedelta(days=20),
                result=ReviewResult.HARD
            ),
        ]

        retention_rate = sm2_engine.calculate_retention_rate(reviews, 30)

        # 2 out of 4 successful reviews = 50%
        assert retention_rate == 0.5

    def test_empty_reviews_retention(self, sm2_engine):
        """Test retention calculation with no reviews"""
        assert sm2_engine.calculate_retention_rate([], 30) == 0.0
        assert sm2_engine.calculate_retention_rate(None, 30) == 0.0

    def test_daily_load_optimization(self, sm2_engine):
        """Test daily review load optimization"""
        optimization = sm2_engine.optimize_daily_load(
            user_id="test_user",
            target_minutes=20,
            user_speed_wpm=250
        )

        assert "recommended_reviews" in optimization
        assert "recommended_new_cards" in optimization
        assert "estimated_time_minutes" in optimization
        assert "confidence_interval" in optimization

        # Should have reasonable numbers
        total_cards = (optimization["recommended_reviews"] +
                       optimization["recommended_new_cards"])
        assert 10 <= total_cards <= 50  # Reasonable range

        # Confidence interval should bracket target
        ci_low, ci_high = optimization["confidence_interval"]
        assert ci_low <= 20 <= ci_high


class TestReviewSessionManager:
    """Test review session management"""

    @pytest.fixture
    def session_manager(self, sm2_engine):
        """Create review session manager"""
        return ReviewSessionManager(sm2_engine)

    def test_start_review_session(self, session_manager):
        """Test starting a new review session"""
        session = session_manager.start_review_session(
            user_id="test_user",
            session_type="mixed",
            target_duration_minutes=15
        )

        assert "session_id" in session
        assert session["user_id"] == "test_user"
        assert session["target_duration_minutes"] == 15
        assert "started_at" in session
        assert "card_queue" in session
        assert "progress" in session
        assert "configuration" in session

        # Progress should be initialized
        progress = session["progress"]
        assert progress["completed"] == 0
        assert "remaining" in progress
        assert "estimated_time_remaining" in progress

    def test_complete_review(self, session_manager):
        """Test completing a review in session"""
        schedule, session_update = session_manager.complete_review(
            session_id="test_session",
            micro_card_id="card_123",
            result=ReviewResult.GOOD,
            confidence_level=4,
            time_spent_seconds=120
        )

        # Should return valid schedule
        assert isinstance(schedule, ReviewSchedule)
        assert schedule.algorithm_used == SchedulingAlgorithm.SM2

        # Should return session update
        assert session_update["session_id"] == "test_session"
        assert session_update["completed_cards"] == 1
        assert session_update["total_time_spent"] == 120
        assert session_update["last_result"] == "good"

    def test_session_id_generation(self, session_manager):
        """Test unique session ID generation"""
        session1 = session_manager.start_review_session("user1")
        session2 = session_manager.start_review_session("user1")

        assert session1["session_id"] != session2["session_id"]
        assert "user1" in session1["session_id"]
        assert "user1" in session2["session_id"]


class TestAlgorithmComparison:
    """Compare algorithms for consistency and performance"""

    def test_algorithm_consistency(self, sample_micro_card):
        """Test that both algorithms handle same inputs consistently"""
        sm2_engine = SpacedRepetitionEngine(SchedulingAlgorithm.SM2)
        leitner_engine = SpacedRepetitionEngine(SchedulingAlgorithm.LEITNER)

        # Test same review scenario
        sm2_schedule = sm2_engine.calculate_next_review(
            sample_micro_card, ReviewResult.GOOD, 4
        )

        leitner_schedule = leitner_engine.calculate_next_review(
            sample_micro_card, ReviewResult.GOOD, 4
        )

        # Both should produce valid schedules
        assert sm2_schedule.next_review_date > datetime.now(timezone.utc)
        assert leitner_schedule.next_review_date > datetime.now(timezone.utc)

        # Both should track algorithm used
        assert sm2_schedule.algorithm_used == SchedulingAlgorithm.SM2
        assert leitner_schedule.algorithm_used == SchedulingAlgorithm.LEITNER

    def test_failure_handling_comparison(self, experienced_card):
        """Test how algorithms handle review failures"""
        sm2_engine = SpacedRepetitionEngine(SchedulingAlgorithm.SM2)
        leitner_engine = SpacedRepetitionEngine(SchedulingAlgorithm.LEITNER)

        sm2_fail = sm2_engine.calculate_next_review(
            experienced_card, ReviewResult.AGAIN, 1
        )

        leitner_fail = leitner_engine.calculate_next_review(
            experienced_card, ReviewResult.AGAIN, 1
        )

        # Both should reset progress on failure
        assert sm2_fail.repetitions == 0
        assert leitner_fail.repetitions == 0
        assert sm2_fail.interval_days == 1
        assert leitner_fail.interval_days == 1


# Performance and edge case tests
class TestEdgeCases:
    """Test edge cases and error conditions"""

    def test_extreme_confidence_values(self, sm2_engine, sample_micro_card):
        """Test handling of extreme confidence values"""
        # Test confidence outside normal range
        schedule = sm2_engine.calculate_next_review(
            sample_micro_card, ReviewResult.GOOD, confidence_level=0
        )
        assert schedule is not None  # Should handle gracefully

        schedule = sm2_engine.calculate_next_review(
            sample_micro_card, ReviewResult.GOOD, confidence_level=10
        )
        assert schedule is not None  # Should handle gracefully

    def test_very_high_repetitions(self, sm2_engine, sample_micro_card):
        """Test cards with very high repetition counts"""
        sample_micro_card.repetitions = 1000
        sample_micro_card.interval_days = 365
        sample_micro_card.ease_factor = 3.5

        schedule = sm2_engine.calculate_next_review(
            sample_micro_card, ReviewResult.GOOD, 4
        )

        # Should handle large numbers without overflow
        assert schedule.interval_days > 0
        assert schedule.interval_days < 10000  # Reasonable upper bound

    def test_zero_interval_handling(self, sm2_engine, sample_micro_card):
        """Test handling of zero or negative intervals"""
        sample_micro_card.interval_days = 0

        schedule = sm2_engine.calculate_next_review(
            sample_micro_card, ReviewResult.GOOD, 3
        )

        # Should always have at least 1 day interval
        assert schedule.interval_days >= 1
