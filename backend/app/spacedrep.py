"""
LearnInSlices - Spaced Repetition Scheduler Engine
Implementation of Leitner System and SM2 algorithm for adaptive review scheduling

Key Features:
- SM2 (SuperMemo 2) algorithm implementation
- Leitner box system for basic spaced repetition
- Performance-based interval adjustment
- Review session scheduling and optimization
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple, Optional
from enum import Enum
import math
from dataclasses import dataclass

from .models import Review, MicroCard, ReviewResult


class SchedulingAlgorithm(Enum):
    """Available spaced repetition algorithms"""
    LEITNER = "leitner"
    SM2 = "sm2"
    ANKI = "anki"  # Modified SM2 variant


@dataclass
class ReviewSchedule:
    """
    Review scheduling result with next review timing and metadata
    """
    next_review_date: datetime
    interval_days: int
    ease_factor: float
    repetitions: int
    algorithm_used: SchedulingAlgorithm
    confidence_score: float = 0.0
    metadata: Dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class SpacedRepetitionEngine:
    """
    Core spaced repetition scheduling engine
    Implements multiple algorithms for adaptive review timing
    """

    # Default SM2 parameters
    DEFAULT_EASE_FACTOR = 2.5
    MIN_EASE_FACTOR = 1.3
    MAX_EASE_FACTOR = 4.0
    EASE_BONUS = 0.1
    EASE_PENALTY = 0.15
    HARD_PENALTY = 0.2

    # Leitner box intervals (days)
    LEITNER_INTERVALS = [1, 3, 7, 14, 30, 90, 180, 365]

    def __init__(
            self,
            algorithm: SchedulingAlgorithm = SchedulingAlgorithm.SM2):
        """
        Initialize the spaced repetition engine

        Args:
            algorithm: The scheduling algorithm to use
        """
        self.algorithm = algorithm

    def calculate_next_review(
        self,
        micro_card: MicroCard,
        review_result: ReviewResult,
        confidence_level: int = 3,
        previous_reviews: List[Review] = None
    ) -> ReviewSchedule:
        """
        Calculate the next review schedule based on performance

        Args:
            micro_card: The micro card being reviewed
            review_result: User's performance on the review
            confidence_level: Self-reported confidence (1-5)
            previous_reviews: Historical review data for context

        Returns:
            ReviewSchedule with next review timing and parameters
        """
        if self.algorithm == SchedulingAlgorithm.SM2:
            return self._calculate_sm2_schedule(
                micro_card, review_result, confidence_level, previous_reviews
            )
        elif self.algorithm == SchedulingAlgorithm.LEITNER:
            return self._calculate_leitner_schedule(
                micro_card, review_result, confidence_level, previous_reviews
            )
        else:
            raise ValueError(f"Unsupported algorithm: {self.algorithm}")

    def _calculate_sm2_schedule(
        self,
        micro_card: MicroCard,
        review_result: ReviewResult,
        confidence_level: int,
        previous_reviews: List[Review] = None
    ) -> ReviewSchedule:
        """
        SM2 (SuperMemo 2) algorithm implementation

        The SM2 algorithm adjusts intervals based on:
        - Ease factor (difficulty multiplier)
        - Repetition number
        - Review performance quality
        """
        current_ease = micro_card.ease_factor or self.DEFAULT_EASE_FACTOR
        current_interval = micro_card.interval_days or 1
        current_reps = micro_card.repetitions or 0

        # Quality scoring based on review result and confidence
        quality = self._map_result_to_quality(review_result, confidence_level)

        # Calculate new ease factor
        new_ease = current_ease + (
            0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        )
        new_ease = max(
            self.MIN_EASE_FACTOR, min(
                self.MAX_EASE_FACTOR, new_ease))

        # Calculate interval and repetitions
        if quality < 3:  # Failed review (AGAIN, some HARD cases)
            new_reps = 0
            new_interval = 1
        else:  # Successful review
            new_reps = current_reps + 1
            if new_reps == 1:
                new_interval = 1
            elif new_reps == 2:
                new_interval = 6
            else:
                new_interval = int(current_interval * new_ease)

        # Apply confidence-based adjustments
        confidence_multiplier = self._get_confidence_multiplier(
            confidence_level)
        new_interval = max(1, int(new_interval * confidence_multiplier))

        next_review_date = datetime.now(
            timezone.utc) + timedelta(days=new_interval)

        return ReviewSchedule(
            next_review_date=next_review_date,
            interval_days=new_interval,
            ease_factor=new_ease,
            repetitions=new_reps,
            algorithm_used=SchedulingAlgorithm.SM2,
            confidence_score=confidence_level / 5.0,
            metadata={
                "quality_score": quality,
                "confidence_multiplier": confidence_multiplier,
                "previous_ease": current_ease,
                "previous_interval": current_interval
            }
        )

    def _calculate_leitner_schedule(
        self,
        micro_card: MicroCard,
        review_result: ReviewResult,
        confidence_level: int,
        previous_reviews: List[Review] = None
    ) -> ReviewSchedule:
        """
        Leitner box system implementation

        Cards progress through boxes with increasing intervals.
        Failed reviews move cards back to earlier boxes.
        """
        current_reps = micro_card.repetitions or 0

        # Determine box progression based on review result
        if review_result == ReviewResult.AGAIN:
            # Move back to box 1
            new_reps = 0
            box_index = 0
        elif review_result == ReviewResult.HARD:
            # Stay in current box or move back one
            new_reps = max(0, current_reps - 1)
            box_index = min(len(self.LEITNER_INTERVALS) - 1, new_reps)
        else:  # GOOD or EASY
            # Advance to next box
            new_reps = current_reps + 1
            box_index = min(len(self.LEITNER_INTERVALS) - 1, new_reps)

        # Get interval from Leitner box
        new_interval = self.LEITNER_INTERVALS[box_index]

        # Apply confidence adjustments for EASY results
        if review_result == ReviewResult.EASY and confidence_level >= 4:
            new_interval = int(new_interval * 1.3)  # Bonus for very confident

        next_review_date = datetime.now(
            timezone.utc) + timedelta(days=new_interval)

        return ReviewSchedule(
            next_review_date=next_review_date,
            interval_days=new_interval,
            ease_factor=self.DEFAULT_EASE_FACTOR,  # Leitner doesn't use ease
            repetitions=new_reps,
            algorithm_used=SchedulingAlgorithm.LEITNER,
            confidence_score=confidence_level / 5.0,
            metadata={
                "leitner_box": box_index + 1,
                "box_intervals": self.LEITNER_INTERVALS,
                "confidence_bonus": review_result == ReviewResult.EASY and confidence_level >= 4
            }
        )

    def _map_result_to_quality(
            self,
            result: ReviewResult,
            confidence: int) -> int:
        """
        Map review result and confidence to SM2 quality score (0-5)
        """
        base_quality = {
            ReviewResult.AGAIN: 0,
            ReviewResult.HARD: 2,
            ReviewResult.GOOD: 3,
            ReviewResult.EASY: 4
        }

        quality = base_quality[result]

        # Adjust based on confidence level
        if result == ReviewResult.GOOD and confidence >= 4:
            quality = 4  # Confident good becomes easy
        elif result == ReviewResult.EASY and confidence == 5:
            quality = 5  # Very confident easy gets max score
        elif result == ReviewResult.HARD and confidence <= 2:
            quality = 1  # Low confidence hard review

        return quality

    def _get_confidence_multiplier(self, confidence_level: int) -> float:
        """
        Calculate interval multiplier based on confidence level
        """
        confidence_multipliers = {
            1: 0.6,  # Very uncertain - shorter interval
            2: 0.8,  # Uncertain - slightly shorter
            3: 1.0,  # Neutral - standard interval
            4: 1.2,  # Confident - slightly longer
            5: 1.4   # Very confident - longer interval
        }
        return confidence_multipliers.get(confidence_level, 1.0)

    def get_due_reviews(
        self,
        user_id: str,
        max_reviews: int = 20,
        include_new_cards: bool = True
    ) -> List[Dict]:
        """
        Get micro cards due for review for a specific user

        Args:
            user_id: User identifier
            max_reviews: Maximum number of reviews to return
            include_new_cards: Whether to include unreviewed cards

        Returns:
            List of micro card review data sorted by priority
        """
        # This would typically query the database
        # For now, return structure for testing
        return []

    def calculate_retention_rate(
        self,
        reviews: List[Review],
        time_window_days: int = 30
    ) -> float:
        """
        Calculate user retention rate over a time window

        Args:
            reviews: List of user review records
            time_window_days: Days to look back for calculation

        Returns:
            Retention rate as percentage (0.0 - 1.0)
        """
        if not reviews:
            return 0.0

        cutoff_date = datetime.now(timezone.utc) - \
            timedelta(days=time_window_days)
        recent_reviews = [r for r in reviews if r.reviewed_at >= cutoff_date]

        if not recent_reviews:
            return 0.0

        successful_reviews = [
            r for r in recent_reviews
            if r.result in [ReviewResult.GOOD, ReviewResult.EASY]
        ]

        return len(successful_reviews) / len(recent_reviews)

    def optimize_daily_load(
        self,
        user_id: str,
        target_minutes: int = 15,
        user_speed_wpm: int = 200
    ) -> Dict:
        """
        Optimize daily review load based on user capacity and targets

        Args:
            user_id: User identifier
            target_minutes: Target daily study time in minutes
            user_speed_wpm: User's reading/processing speed

        Returns:
            Optimized review schedule with card recommendations
        """
        # Estimate cards per minute based on type and user speed
        estimated_cards_per_minute = {
            'concept': 1.5,
            'quiz': 0.8,
            'drill': 0.6,
            'video': 0.3,
            'interactive': 0.4
        }

        total_estimated_cards = target_minutes * 1.2  # Average across types

        return {
            "recommended_reviews": int(total_estimated_cards * 0.7),
            "recommended_new_cards": int(total_estimated_cards * 0.3),
            "estimated_time_minutes": target_minutes,
            "confidence_interval": (target_minutes * 0.8, target_minutes * 1.2)
        }


class ReviewSessionManager:
    """
    Manages review sessions and learning session optimization
    """

    def __init__(self, spaced_rep_engine: SpacedRepetitionEngine):
        self.engine = spaced_rep_engine

    def start_review_session(
        self,
        user_id: str,
        session_type: str = "mixed",  # mixed, review_only, new_only
        target_duration_minutes: int = 15
    ) -> Dict:
        """
        Initialize a new review session with optimized card selection

        Args:
            user_id: User identifier
            session_type: Type of session to create
            target_duration_minutes: Target session length

        Returns:
            Session configuration with card queue
        """
        session_id = f"session_{user_id}_{datetime.now().timestamp()}"

        # Get optimized load recommendation
        load_config = self.engine.optimize_daily_load(
            user_id, target_duration_minutes
        )

        return {
            "session_id": session_id,
            "user_id": user_id,
            "started_at": datetime.now(timezone.utc),
            "target_duration_minutes": target_duration_minutes,
            "card_queue": [],  # Would be populated from database
            "progress": {
                "completed": 0,
                "remaining": load_config["recommended_reviews"],
                "estimated_time_remaining": target_duration_minutes
            },
            "configuration": load_config
        }

    def complete_review(
        self,
        session_id: str,
        micro_card_id: str,
        result: ReviewResult,
        confidence_level: int,
        time_spent_seconds: int
    ) -> Tuple[ReviewSchedule, Dict]:
        """
        Process a completed review and update scheduling

        Args:
            session_id: Current session identifier
            micro_card_id: Reviewed card identifier
            result: Review outcome
            confidence_level: User confidence (1-5)
            time_spent_seconds: Time spent on review

        Returns:
            Tuple of (new schedule, session update)
        """
        # This would integrate with database operations
        # For now, return structure for testing

        mock_card = MicroCard()  # Would load from database
        schedule = self.engine.calculate_next_review(
            mock_card, result, confidence_level
        )

        session_update = {
            "session_id": session_id,
            "completed_cards": 1,  # Increment
            "total_time_spent": time_spent_seconds,
            "last_result": result.value,
            "performance_trend": "improving"  # Would calculate from history
        }

        return schedule, session_update
