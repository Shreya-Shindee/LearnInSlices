"""
Gamification Engine for LearnInSlices
Implements XP system, badges, achievements, and learning streaks

Key Features:
- Experience points (XP) system with configurable rewards
- Dynamic badge system with multiple categories
- Learning streak tracking with bonus multipliers
- Level progression with skill-based advancement
- Challenge and quest system for engagement
- Leaderboard and ranking system
"""

from enum import Enum
from typing import Dict, List, Optional, Set, Tuple
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass, field
import json
import logging

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from ..app.models import User, MicroCard, Review


# Badge Categories and Types
class BadgeCategory(Enum):
    """Categories of achievement badges"""
    CONSISTENCY = "consistency"
    MASTERY = "mastery"
    SPEED = "speed"
    SOCIAL = "social"
    EXPLORER = "explorer"
    SPECIAL = "special"


class BadgeType(Enum):
    """Specific badge types within categories"""
    # Consistency badges
    DAILY_STREAK_3 = "daily_streak_3"
    DAILY_STREAK_7 = "daily_streak_7"
    DAILY_STREAK_30 = "daily_streak_30"
    WEEKLY_GOAL = "weekly_goal"
    
    # Mastery badges
    TOPIC_MASTER = "topic_master"
    ACCURACY_EXPERT = "accuracy_expert"
    REVIEW_CHAMPION = "review_champion"
    
    # Speed badges
    SPEED_LEARNER = "speed_learner"
    QUICK_DRAW = "quick_draw"
    LIGHTNING_ROUND = "lightning_round"
    
    # Social badges
    HELPER = "helper"
    COLLABORATOR = "collaborator"
    MENTOR = "mentor"
    
    # Explorer badges
    CURIOUS_MIND = "curious_mind"
    DIVERSE_LEARNER = "diverse_learner"
    PIONEER = "pioneer"


@dataclass
class XPReward:
    """Configuration for XP rewards"""
    activity: str
    base_xp: int
    multiplier_conditions: Dict[str, float] = field(default_factory=dict)
    max_daily: Optional[int] = None


@dataclass
class BadgeDefinition:
    """Definition of an achievement badge"""
    badge_type: BadgeType
    category: BadgeCategory
    name: str
    description: str
    icon: str
    requirements: Dict[str, any]
    xp_reward: int = 0
    rarity: str = "common"  # common, rare, epic, legendary


class GamificationModels:
    """Database models for gamification features"""
    
    Base = declarative_base()
    
    class UserProgress(Base):
        """User's overall progress and stats"""
        __tablename__ = "user_progress"
        
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), unique=True)
        
        # XP and Level
        total_xp = Column(Integer, default=0)
        current_level = Column(Integer, default=1)
        xp_to_next_level = Column(Integer, default=100)
        
        # Streaks
        current_daily_streak = Column(Integer, default=0)
        longest_daily_streak = Column(Integer, default=0)
        last_activity_date = Column(DateTime(timezone=True))
        
        # Stats
        total_cards_reviewed = Column(Integer, default=0)
        total_study_time_minutes = Column(Integer, default=0)
        average_accuracy = Column(Integer, default=0)  # Percentage
        
        # Achievements
        badges_earned = Column(Integer, default=0)
        challenges_completed = Column(Integer, default=0)
        
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        
        # Relationships
        user = relationship("User", back_populates="progress")
        badges = relationship("UserBadge", back_populates="user_progress")
        
    class UserBadge(Base):
        """User's earned badges"""
        __tablename__ = "user_badges"
        
        id = Column(Integer, primary_key=True, index=True)
        user_progress_id = Column(Integer, ForeignKey("user_progress.id"))
        
        badge_type = Column(String(50))  # BadgeType enum value
        category = Column(String(50))    # BadgeCategory enum value
        name = Column(String(100))
        description = Column(Text)
        icon = Column(String(100))
        
        earned_at = Column(DateTime(timezone=True), default=datetime.utcnow)
        xp_rewarded = Column(Integer, default=0)
        
        # Achievement context
        achievement_data = Column(Text)  # JSON data about what triggered the badge
        
        # Relationships
        user_progress = relationship("UserProgress", back_populates="badges")
    
    class LearningStreak(Base):
        """Detailed streak tracking"""
        __tablename__ = "learning_streaks"
        
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"))
        
        streak_type = Column(String(50))  # daily, weekly, monthly
        start_date = Column(DateTime(timezone=True))
        end_date = Column(DateTime(timezone=True))
        streak_length = Column(Integer)
        is_active = Column(Boolean, default=True)
        
        # Streak context
        activity_count = Column(Integer, default=0)
        best_performance = Column(Integer, default=0)
        
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    class Challenge(Base):
        """Learning challenges and quests"""
        __tablename__ = "challenges"
        
        id = Column(Integer, primary_key=True, index=True)
        
        name = Column(String(100))
        description = Column(Text)
        challenge_type = Column(String(50))  # daily, weekly, special
        
        # Requirements
        requirements = Column(Text)  # JSON requirements
        xp_reward = Column(Integer)
        badge_reward = Column(String(50))  # Optional badge type
        
        # Timing
        start_date = Column(DateTime(timezone=True))
        end_date = Column(DateTime(timezone=True))
        is_active = Column(Boolean, default=True)
        
        # Participation tracking
        participant_count = Column(Integer, default=0)
        completion_count = Column(Integer, default=0)
        
        created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    class UserChallenge(Base):
        """User participation in challenges"""
        __tablename__ = "user_challenges"
        
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"))
        challenge_id = Column(Integer, ForeignKey("challenges.id"))
        
        # Progress
        progress_percent = Column(Integer, default=0)
        is_completed = Column(Boolean, default=False)
        completed_at = Column(DateTime(timezone=True))
        
        # Performance
        performance_data = Column(Text)  # JSON performance metrics
        ranking = Column(Integer)  # Position in challenge leaderboard
        
        joined_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class GamificationEngine:
    """
    Core gamification engine handling XP, badges, streaks, and challenges
    """
    
    def __init__(self, db_session):
        """
        Initialize gamification engine
        
        Args:
            db_session: Database session for persistence
        """
        self.db = db_session
        self.logger = logging.getLogger(__name__)
        
        # Initialize XP reward configuration
        self.xp_rewards = self._init_xp_rewards()
        
        # Initialize badge definitions
        self.badge_definitions = self._init_badge_definitions()
        
        # Level progression formula
        self.level_xp_formula = lambda level: 100 * (level ** 1.5)
    
    def _init_xp_rewards(self) -> Dict[str, XPReward]:
        """Initialize XP reward configuration"""
        return {
            "card_review_correct": XPReward(
                activity="card_review_correct",
                base_xp=10,
                multiplier_conditions={
                    "streak_3+": 1.2,
                    "streak_7+": 1.5,
                    "first_try": 1.3,
                    "difficulty_advanced": 1.4
                },
                max_daily=500
            ),
            "card_review_incorrect": XPReward(
                activity="card_review_incorrect",
                base_xp=3,
                max_daily=100
            ),
            "daily_goal_complete": XPReward(
                activity="daily_goal_complete",
                base_xp=50,
                multiplier_conditions={
                    "streak_bonus": 1.1
                }
            ),
            "badge_earned": XPReward(
                activity="badge_earned",
                base_xp=100,
                multiplier_conditions={
                    "rare": 1.5,
                    "epic": 2.0,
                    "legendary": 3.0
                }
            ),
            "peer_help": XPReward(
                activity="peer_help",
                base_xp=25,
                max_daily=200
            ),
            "challenge_complete": XPReward(
                activity="challenge_complete",
                base_xp=200,
                multiplier_conditions={
                    "top_10_percent": 1.5,
                    "first_place": 2.0
                }
            )
        }
    
    def _init_badge_definitions(self) -> Dict[BadgeType, BadgeDefinition]:
        """Initialize badge definitions"""
        return {
            # Consistency badges
            BadgeType.DAILY_STREAK_3: BadgeDefinition(
                badge_type=BadgeType.DAILY_STREAK_3,
                category=BadgeCategory.CONSISTENCY,
                name="Steady Learner",
                description="Complete learning activities for 3 consecutive days",
                icon="🔥",
                requirements={"daily_streak": 3},
                xp_reward=50
            ),
            BadgeType.DAILY_STREAK_7: BadgeDefinition(
                badge_type=BadgeType.DAILY_STREAK_7,
                category=BadgeCategory.CONSISTENCY,
                name="Week Warrior",
                description="Complete learning activities for 7 consecutive days",
                icon="🚀",
                requirements={"daily_streak": 7},
                xp_reward=150,
                rarity="rare"
            ),
            BadgeType.DAILY_STREAK_30: BadgeDefinition(
                badge_type=BadgeType.DAILY_STREAK_30,
                category=BadgeCategory.CONSISTENCY,
                name="Dedication Master",
                description="Complete learning activities for 30 consecutive days",
                icon="👑",
                requirements={"daily_streak": 30},
                xp_reward=500,
                rarity="epic"
            ),
            
            # Mastery badges
            BadgeType.TOPIC_MASTER: BadgeDefinition(
                badge_type=BadgeType.TOPIC_MASTER,
                category=BadgeCategory.MASTERY,
                name="Topic Master",
                description="Achieve 90%+ accuracy in a skill area",
                icon="🎯",
                requirements={"skill_accuracy": 90, "min_reviews": 20},
                xp_reward=100
            ),
            BadgeType.ACCURACY_EXPERT: BadgeDefinition(
                badge_type=BadgeType.ACCURACY_EXPERT,
                category=BadgeCategory.MASTERY,
                name="Accuracy Expert",
                description="Maintain 95%+ overall accuracy across 100+ reviews",
                icon="🎪",
                requirements={"overall_accuracy": 95, "min_reviews": 100},
                xp_reward=300,
                rarity="rare"
            ),
            
            # Speed badges
            BadgeType.SPEED_LEARNER: BadgeDefinition(
                badge_type=BadgeType.SPEED_LEARNER,
                category=BadgeCategory.SPEED,
                name="Speed Learner",
                description="Complete 50 reviews in under 30 minutes",
                icon="⚡",
                requirements={"reviews_in_session": 50, "max_time_minutes": 30},
                xp_reward=75
            ),
            
            # Social badges
            BadgeType.HELPER: BadgeDefinition(
                badge_type=BadgeType.HELPER,
                category=BadgeCategory.SOCIAL,
                name="Helpful Hand",
                description="Help 10 peers with their learning",
                icon="🤝",
                requirements={"peer_helps": 10},
                xp_reward=100
            ),
            
            # Explorer badges
            BadgeType.CURIOUS_MIND: BadgeDefinition(
                badge_type=BadgeType.CURIOUS_MIND,
                category=BadgeCategory.EXPLORER,
                name="Curious Mind",
                description="Explore 5 different learning topics",
                icon="🔍",
                requirements={"unique_topics": 5},
                xp_reward=80
            )
        }
    
    def award_xp(self, user_id: int, activity: str, 
                 context: Dict = None) -> Tuple[int, bool]:
        """
        Award XP for user activity
        
        Args:
            user_id: User receiving XP
            activity: Type of activity
            context: Additional context for multipliers
            
        Returns:
            Tuple of (xp_awarded, level_up_occurred)
        """
        if activity not in self.xp_rewards:
            self.logger.warning(f"Unknown activity for XP: {activity}")
            return 0, False
        
        reward_config = self.xp_rewards[activity]
        context = context or {}
        
        # Calculate base XP
        xp_amount = reward_config.base_xp
        
        # Apply multipliers
        for condition, multiplier in reward_config.multiplier_conditions.items():
            if condition in context and context[condition]:
                xp_amount = int(xp_amount * multiplier)
        
        # Check daily limits
        if reward_config.max_daily:
            daily_xp = self._get_daily_xp_for_activity(user_id, activity)
            if daily_xp + xp_amount > reward_config.max_daily:
                xp_amount = max(0, reward_config.max_daily - daily_xp)
        
        # Update user progress
        level_up = self._update_user_xp(user_id, xp_amount)
        
        self.logger.info(f"Awarded {xp_amount} XP to user {user_id} for {activity}")
        return xp_amount, level_up
    
    def _update_user_xp(self, user_id: int, xp_amount: int) -> bool:
        """Update user XP and check for level up"""
        progress = self._get_or_create_user_progress(user_id)
        
        old_level = progress.current_level
        progress.total_xp += xp_amount
        
        # Check for level up
        while progress.total_xp >= progress.xp_to_next_level:
            progress.total_xp -= progress.xp_to_next_level
            progress.current_level += 1
            progress.xp_to_next_level = int(self.level_xp_formula(progress.current_level))
        
        progress.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        
        level_up_occurred = progress.current_level > old_level
        if level_up_occurred:
            self.logger.info(f"User {user_id} leveled up to {progress.current_level}")
        
        return level_up_occurred
    
    def check_and_award_badges(self, user_id: int, 
                              activity_context: Dict) -> List[BadgeDefinition]:
        """
        Check if user has earned any new badges and award them
        
        Args:
            user_id: User to check badges for
            activity_context: Context of recent activity
            
        Returns:
            List of newly awarded badges
        """
        progress = self._get_or_create_user_progress(user_id)
        earned_badge_types = {badge.badge_type for badge in progress.badges}
        newly_awarded = []
        
        for badge_type, badge_def in self.badge_definitions.items():
            # Skip if already earned
            if badge_type.value in earned_badge_types:
                continue
            
            # Check requirements
            if self._check_badge_requirements(user_id, badge_def, activity_context):
                self._award_badge(user_id, badge_def)
                newly_awarded.append(badge_def)
                
                # Award XP for badge
                if badge_def.xp_reward > 0:
                    self.award_xp(user_id, "badge_earned", {
                        badge_def.rarity: True
                    })
        
        return newly_awarded
    
    def _check_badge_requirements(self, user_id: int, 
                                 badge_def: BadgeDefinition,
                                 context: Dict) -> bool:
        """Check if user meets badge requirements"""
        progress = self._get_or_create_user_progress(user_id)
        requirements = badge_def.requirements
        
        # Check streak requirements
        if "daily_streak" in requirements:
            return progress.current_daily_streak >= requirements["daily_streak"]
        
        # Check accuracy requirements
        if "overall_accuracy" in requirements:
            min_reviews = requirements.get("min_reviews", 1)
            if progress.total_cards_reviewed < min_reviews:
                return False
            return progress.average_accuracy >= requirements["overall_accuracy"]
        
        # Check skill-specific accuracy
        if "skill_accuracy" in requirements:
            # This would require skill-specific tracking
            # For now, use overall accuracy as approximation
            min_reviews = requirements.get("min_reviews", 1)
            if progress.total_cards_reviewed < min_reviews:
                return False
            return progress.average_accuracy >= requirements["skill_accuracy"]
        
        # Check activity counts from context
        for req_key, req_value in requirements.items():
            if req_key in context:
                if context[req_key] < req_value:
                    return False
        
        return True
    
    def _award_badge(self, user_id: int, badge_def: BadgeDefinition):
        """Award a badge to user"""
        progress = self._get_or_create_user_progress(user_id)
        
        badge = GamificationModels.UserBadge(
            user_progress_id=progress.id,
            badge_type=badge_def.badge_type.value,
            category=badge_def.category.value,
            name=badge_def.name,
            description=badge_def.description,
            icon=badge_def.icon,
            xp_rewarded=badge_def.xp_reward,
            achievement_data=json.dumps({
                "earned_at": datetime.now(timezone.utc).isoformat(),
                "rarity": badge_def.rarity
            })
        )
        
        self.db.add(badge)
        progress.badges_earned += 1
        progress.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        
        self.logger.info(f"Awarded badge '{badge_def.name}' to user {user_id}")
    
    def update_daily_streak(self, user_id: int) -> Dict:
        """
        Update user's daily learning streak
        
        Args:
            user_id: User to update streak for
            
        Returns:
            Dictionary with streak information
        """
        progress = self._get_or_create_user_progress(user_id)
        today = datetime.now(timezone.utc).date()
        
        # Check if this is first activity today
        if progress.last_activity_date:
            last_date = progress.last_activity_date.date()
            
            if last_date == today:
                # Already counted today
                return {
                    "current_streak": progress.current_daily_streak,
                    "streak_updated": False,
                    "is_new_record": False
                }
            elif last_date == today - timedelta(days=1):
                # Consecutive day - extend streak
                progress.current_daily_streak += 1
            else:
                # Streak broken - reset
                progress.current_daily_streak = 1
        else:
            # First time activity
            progress.current_daily_streak = 1
        
        # Update last activity date
        progress.last_activity_date = datetime.now(timezone.utc)
        
        # Check for new record
        is_new_record = progress.current_daily_streak > progress.longest_daily_streak
        if is_new_record:
            progress.longest_daily_streak = progress.current_daily_streak
        
        progress.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return {
            "current_streak": progress.current_daily_streak,
            "streak_updated": True,
            "is_new_record": is_new_record,
            "longest_streak": progress.longest_daily_streak
        }
    
    def get_user_stats(self, user_id: int) -> Dict:
        """Get comprehensive user gamification stats"""
        progress = self._get_or_create_user_progress(user_id)
        
        return {
            "level": progress.current_level,
            "total_xp": progress.total_xp,
            "xp_to_next_level": progress.xp_to_next_level,
            "xp_progress_percent": int((progress.total_xp / progress.xp_to_next_level) * 100),
            "current_streak": progress.current_daily_streak,
            "longest_streak": progress.longest_daily_streak,
            "badges_earned": progress.badges_earned,
            "total_reviews": progress.total_cards_reviewed,
            "average_accuracy": progress.average_accuracy,
            "study_time_hours": round(progress.total_study_time_minutes / 60, 1),
            "challenges_completed": progress.challenges_completed
        }
    
    def get_leaderboard(self, timeframe: str = "all_time", 
                       limit: int = 10) -> List[Dict]:
        """
        Get leaderboard rankings
        
        Args:
            timeframe: "daily", "weekly", "monthly", or "all_time"
            limit: Number of top users to return
            
        Returns:
            List of user rankings with stats
        """
        # For this implementation, we'll use all-time total XP
        # In production, you'd want separate tables for different timeframes
        
        query = self.db.query(GamificationModels.UserProgress)\
                      .order_by(GamificationModels.UserProgress.total_xp.desc())\
                      .limit(limit)
        
        leaderboard = []
        for rank, progress in enumerate(query.all(), 1):
            leaderboard.append({
                "rank": rank,
                "user_id": progress.user_id,
                "level": progress.current_level,
                "total_xp": progress.total_xp,
                "badges_earned": progress.badges_earned,
                "current_streak": progress.current_daily_streak
            })
        
        return leaderboard
    
    def _get_or_create_user_progress(self, user_id: int):
        """Get or create user progress record"""
        progress = self.db.query(GamificationModels.UserProgress)\
                         .filter(GamificationModels.UserProgress.user_id == user_id)\
                         .first()
        
        if not progress:
            progress = GamificationModels.UserProgress(
                user_id=user_id,
                xp_to_next_level=int(self.level_xp_formula(1))
            )
            self.db.add(progress)
            self.db.commit()
        
        return progress
    
    def _get_daily_xp_for_activity(self, user_id: int, activity: str) -> int:
        """Get XP earned today for specific activity (placeholder)"""
        # In production, you'd track this in a separate table
        # For now, return 0 to allow unlimited XP
        return 0
    
    def process_review_activity(self, user_id: int, review_result: Dict) -> Dict:
        """
        Process a completed review for gamification
        
        Args:
            user_id: User who completed the review
            review_result: Review completion data
            
        Returns:
            Gamification results (XP, badges, streaks)
        """
        results = {
            "xp_awarded": 0,
            "badges_earned": [],
            "streak_info": {},
            "level_up": False
        }
        
        # Update daily streak
        results["streak_info"] = self.update_daily_streak(user_id)
        
        # Award XP based on review result
        activity = "card_review_correct" if review_result.get("correct") else "card_review_incorrect"
        
        # Build context for XP multipliers
        context = {
            "first_try": review_result.get("attempts", 1) == 1,
            "difficulty_advanced": review_result.get("difficulty") == "advanced"
        }
        
        # Add streak bonuses
        streak = results["streak_info"]["current_streak"]
        if streak >= 3:
            context["streak_3+"] = True
        if streak >= 7:
            context["streak_7+"] = True
        
        # Award XP
        xp_awarded, level_up = self.award_xp(user_id, activity, context)
        results["xp_awarded"] = xp_awarded
        results["level_up"] = level_up
        
        # Check for new badges
        badge_context = {
            "daily_streak": streak,
            "total_reviews": review_result.get("user_total_reviews", 0),
            "accuracy": review_result.get("user_accuracy", 0)
        }
        
        newly_earned = self.check_and_award_badges(user_id, badge_context)
        results["badges_earned"] = [
            {
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "rarity": badge.rarity
            }
            for badge in newly_earned
        ]
        
        return results
