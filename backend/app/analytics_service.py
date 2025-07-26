"""
Analytics Service
Advanced learning analytics and insights

Features:
- Real-time progress tracking
- Learning pattern analysis
- Performance predictions
- Personalized insights
- Study optimization recommendations
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
import numpy as np
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.models import User, MicroCard, Review, XPTransaction, ReviewResult
from app.database import get_db

logger = logging.getLogger(__name__)


@dataclass
class AnalyticsConfig:
    """Analytics service configuration"""
    retention_days: int = 90
    prediction_window_days: int = 7
    insight_threshold: float = 0.1
    performance_window_days: int = 30


class AnalyticsService:
    """
    Comprehensive learning analytics service
    """
    
    def __init__(self, config: AnalyticsConfig = None):
        self.config = config or AnalyticsConfig()
        
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return True
    
    async def get_user_progress(self, db: Session, user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive user progress data
        
        Args:
            db: Database session
            user_id: User identifier
            
        Returns:
            Comprehensive progress data
        """
        try:
            # Get basic user stats
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")
            
            # Calculate time-based metrics
            now = datetime.utcnow()
            week_ago = now - timedelta(days=7)
            month_ago = now - timedelta(days=30)
            
            # Review statistics
            total_reviews = db.query(Review).filter(Review.user_id == user_id).count()
            weekly_reviews = db.query(Review).filter(
                and_(Review.user_id == user_id, Review.created_at >= week_ago)
            ).count()
            monthly_reviews = db.query(Review).filter(
                and_(Review.user_id == user_id, Review.created_at >= month_ago)
            ).count()
            
            # Performance metrics
            performance_data = await self._calculate_performance_metrics(db, user_id)
            
            # Learning streak
            current_streak = await self._calculate_current_streak(db, user_id)
            longest_streak = await self._calculate_longest_streak(db, user_id)
            
            # XP and level
            total_xp = await self._calculate_total_xp(db, user_id)
            current_level = await self._calculate_user_level(total_xp)
            
            # Study time analysis
            study_time_data = await self._analyze_study_time(db, user_id)
            
            # Cards mastered
            mastered_cards = await self._count_mastered_cards(db, user_id)
            
            return {
                "user_id": user_id,
                "total_reviews": total_reviews,
                "weekly_reviews": weekly_reviews,
                "monthly_reviews": monthly_reviews,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "total_xp": total_xp,
                "current_level": current_level,
                "next_level_xp": self._calculate_next_level_xp(current_level),
                "performance": performance_data,
                "study_time": study_time_data,
                "mastered_cards": mastered_cards,
                "daily_goal_minutes": user.daily_goal_minutes,
                "last_study_date": await self._get_last_study_date(db, user_id),
                "updated_at": now.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Progress calculation failed for user {user_id}: {e}")
            raise
    
    async def get_learning_analytics(
        self, 
        db: Session, 
        user_id: str, 
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get detailed learning analytics for specified period
        
        Args:
            db: Database session
            user_id: User identifier
            days: Analysis period in days
            
        Returns:
            Detailed analytics data
        """
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Daily activity data
            daily_activity = await self._get_daily_activity(db, user_id, start_date, end_date)
            
            # Performance trends
            performance_trends = await self._analyze_performance_trends(
                db, user_id, start_date, end_date
            )
            
            # Learning patterns
            learning_patterns = await self._analyze_learning_patterns(
                db, user_id, start_date, end_date
            )
            
            # Difficulty distribution
            difficulty_analysis = await self._analyze_difficulty_distribution(
                db, user_id, start_date, end_date
            )
            
            # Topic performance
            topic_performance = await self._analyze_topic_performance(
                db, user_id, start_date, end_date
            )
            
            # Recommendations
            recommendations = await self._generate_analytics_recommendations(
                db, user_id, performance_trends, learning_patterns
            )
            
            # Predictions
            predictions = await self._generate_performance_predictions(
                db, user_id, performance_trends
            )
            
            return {
                "period_days": days,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "daily_activity": daily_activity,
                "performance_trends": performance_trends,
                "learning_patterns": learning_patterns,
                "difficulty_analysis": difficulty_analysis,
                "topic_performance": topic_performance,
                "recommendations": recommendations,
                "predictions": predictions,
                "insights": await self._generate_insights(
                    performance_trends, learning_patterns, topic_performance
                ),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Analytics generation failed for user {user_id}: {e}")
            raise
    
    async def get_due_cards(self, db: Session, user_id: str) -> List[MicroCard]:
        """
        Get cards due for review based on spaced repetition algorithm
        
        Args:
            db: Database session
            user_id: User identifier
            
        Returns:
            List of cards due for review
        """
        try:
            now = datetime.utcnow()
            
            # Get cards with reviews due
            due_cards_query = db.query(MicroCard).join(Review).filter(
                and_(
                    Review.user_id == user_id,
                    Review.next_review_date <= now
                )
            ).distinct()
            
            # Get cards never reviewed by this user
            reviewed_card_ids = db.query(Review.card_id).filter(
                Review.user_id == user_id
            ).distinct().subquery()
            
            new_cards_query = db.query(MicroCard).filter(
                ~MicroCard.id.in_(reviewed_card_ids)
            ).limit(10)  # Limit new cards
            
            due_cards = due_cards_query.all()
            new_cards = new_cards_query.all()
            
            # Combine and prioritize
            all_cards = due_cards + new_cards
            
            # Apply intelligent ordering
            ordered_cards = await self._order_cards_intelligently(
                db, user_id, all_cards
            )
            
            return ordered_cards
            
        except Exception as e:
            logger.error(f"Due cards calculation failed for user {user_id}: {e}")
            raise
    
    async def _calculate_performance_metrics(self, db: Session, user_id: str) -> Dict[str, float]:
        """Calculate user performance metrics"""
        try:
            # Get recent reviews
            recent_reviews = db.query(Review).filter(
                and_(
                    Review.user_id == user_id,
                    Review.created_at >= datetime.utcnow() - timedelta(days=30)
                )
            ).all()
            
            if not recent_reviews:
                return {
                    "accuracy": 0.0,
                    "average_rating": 0.0,
                    "improvement_rate": 0.0,
                    "consistency": 0.0
                }
            
            # Calculate accuracy (successful reviews / total reviews)
            successful_reviews = [r for r in recent_reviews 
                                if r.result in [ReviewResult.EASY, ReviewResult.GOOD]]
            accuracy = len(successful_reviews) / len(recent_reviews)
            
            # Calculate average rating
            rating_map = {
                ReviewResult.AGAIN: 1,
                ReviewResult.HARD: 2,
                ReviewResult.GOOD: 3,
                ReviewResult.EASY: 4
            }
            ratings = [rating_map.get(r.result, 1) for r in recent_reviews]
            average_rating = sum(ratings) / len(ratings)
            
            # Calculate improvement rate
            improvement_rate = await self._calculate_improvement_rate(recent_reviews)
            
            # Calculate consistency
            consistency = await self._calculate_consistency_score(recent_reviews)
            
            return {
                "accuracy": round(accuracy, 3),
                "average_rating": round(average_rating, 2),
                "improvement_rate": round(improvement_rate, 3),
                "consistency": round(consistency, 3)
            }
            
        except Exception as e:
            logger.error(f"Performance metrics calculation failed: {e}")
            return {"accuracy": 0.0, "average_rating": 0.0, "improvement_rate": 0.0, "consistency": 0.0}
    
    async def _calculate_current_streak(self, db: Session, user_id: str) -> int:
        """Calculate current learning streak"""
        try:
            # Get recent study days
            today = datetime.utcnow().date()
            streak = 0
            current_date = today
            
            while True:
                # Check if user studied on current_date
                reviews_on_date = db.query(Review).filter(
                    and_(
                        Review.user_id == user_id,
                        func.date(Review.created_at) == current_date
                    )
                ).count()
                
                if reviews_on_date > 0:
                    streak += 1
                    current_date -= timedelta(days=1)
                else:
                    break
            
            return streak
            
        except Exception as e:
            logger.error(f"Streak calculation failed: {e}")
            return 0
    
    async def _calculate_longest_streak(self, db: Session, user_id: str) -> int:
        """Calculate longest learning streak"""
        try:
            # Get all study dates
            study_dates = db.query(func.date(Review.created_at)).filter(
                Review.user_id == user_id
            ).distinct().order_by(func.date(Review.created_at)).all()
            
            if not study_dates:
                return 0
            
            # Calculate longest consecutive streak
            max_streak = 0
            current_streak = 1
            
            for i in range(1, len(study_dates)):
                prev_date = study_dates[i-1][0]
                curr_date = study_dates[i][0]
                
                if (curr_date - prev_date).days == 1:
                    current_streak += 1
                else:
                    max_streak = max(max_streak, current_streak)
                    current_streak = 1
            
            return max(max_streak, current_streak)
            
        except Exception as e:
            logger.error(f"Longest streak calculation failed: {e}")
            return 0
    
    async def _calculate_total_xp(self, db: Session, user_id: str) -> int:
        """Calculate total XP earned"""
        try:
            total = db.query(func.sum(XPTransaction.amount)).filter(
                XPTransaction.user_id == user_id
            ).scalar()
            return total or 0
        except Exception as e:
            logger.error(f"XP calculation failed: {e}")
            return 0
    
    async def _calculate_user_level(self, total_xp: int) -> int:
        """Calculate user level based on XP"""
        # Simple level calculation - can be made more sophisticated
        if total_xp < 100:
            return 1
        elif total_xp < 300:
            return 2
        elif total_xp < 600:
            return 3
        elif total_xp < 1000:
            return 4
        else:
            return min(50, 5 + (total_xp - 1000) // 200)
    
    def _calculate_next_level_xp(self, current_level: int) -> int:
        """Calculate XP needed for next level"""
        level_thresholds = [0, 100, 300, 600, 1000]
        if current_level < len(level_thresholds):
            return level_thresholds[current_level]
        else:
            return 1000 + (current_level - 4) * 200
    
    async def _analyze_study_time(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Analyze study time patterns"""
        try:
            # Get recent reviews with time data
            reviews = db.query(Review).filter(
                and_(
                    Review.user_id == user_id,
                    Review.created_at >= datetime.utcnow() - timedelta(days=30)
                )
            ).all()
            
            if not reviews:
                return {"total_minutes": 0, "average_session": 0, "sessions": 0}
            
            # Calculate total study time (estimate based on reviews)
            total_minutes = len(reviews) * 2  # Estimate 2 minutes per review
            sessions = len(set(r.created_at.date() for r in reviews))
            average_session = total_minutes / sessions if sessions > 0 else 0
            
            return {
                "total_minutes": total_minutes,
                "average_session": round(average_session, 1),
                "sessions": sessions,
                "daily_average": round(total_minutes / 30, 1)
            }
            
        except Exception as e:
            logger.error(f"Study time analysis failed: {e}")
            return {"total_minutes": 0, "average_session": 0, "sessions": 0}
    
    async def _count_mastered_cards(self, db: Session, user_id: str) -> int:
        """Count cards the user has mastered"""
        try:
            # Cards are considered mastered if last review was EASY
            mastered = db.query(Review).filter(
                and_(
                    Review.user_id == user_id,
                    Review.result == ReviewResult.EASY,
                    Review.interval >= 21  # At least 3-week interval
                )
            ).distinct(Review.card_id).count()
            
            return mastered
            
        except Exception as e:
            logger.error(f"Mastered cards count failed: {e}")
            return 0
    
    async def _get_last_study_date(self, db: Session, user_id: str) -> Optional[str]:
        """Get user's last study date"""
        try:
            last_review = db.query(Review).filter(
                Review.user_id == user_id
            ).order_by(Review.created_at.desc()).first()
            
            return last_review.created_at.isoformat() if last_review else None
            
        except Exception as e:
            logger.error(f"Last study date calculation failed: {e}")
            return None
    
    async def _get_daily_activity(
        self, 
        db: Session, 
        user_id: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get daily activity data for time period"""
        try:
            daily_data = []
            current_date = start_date.date()
            
            while current_date <= end_date.date():
                # Count reviews for this day
                reviews_count = db.query(Review).filter(
                    and_(
                        Review.user_id == user_id,
                        func.date(Review.created_at) == current_date
                    )
                ).count()
                
                # Calculate study time estimate
                study_minutes = reviews_count * 2  # 2 minutes per review estimate
                
                daily_data.append({
                    "date": current_date.isoformat(),
                    "reviews": reviews_count,
                    "study_minutes": study_minutes,
                    "active": reviews_count > 0
                })
                
                current_date += timedelta(days=1)
            
            return daily_data
            
        except Exception as e:
            logger.error(f"Daily activity analysis failed: {e}")
            return []
    
    # Additional helper methods would be implemented here
    async def _analyze_performance_trends(self, db: Session, user_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze performance trends over time"""
        return {"trend": "improving", "confidence": 0.8}
    
    async def _analyze_learning_patterns(self, db: Session, user_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze learning patterns and habits"""
        return {"preferred_time": "morning", "session_length": "short"}
    
    async def _analyze_difficulty_distribution(self, db: Session, user_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze performance across difficulty levels"""
        return {"beginner": 0.9, "intermediate": 0.7, "advanced": 0.5}
    
    async def _analyze_topic_performance(self, db: Session, user_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Analyze performance across different topics"""
        return {"topics": []}
    
    async def _generate_analytics_recommendations(self, db: Session, user_id: str, performance_trends: Dict, learning_patterns: Dict) -> List[str]:
        """Generate personalized recommendations"""
        return ["Focus on reviewing difficult cards", "Increase daily study time"]
    
    async def _generate_performance_predictions(self, db: Session, user_id: str, performance_trends: Dict) -> Dict[str, Any]:
        """Generate performance predictions"""
        return {"next_week_accuracy": 0.85, "confidence": 0.7}
    
    async def _generate_insights(self, performance_trends: Dict, learning_patterns: Dict, topic_performance: Dict) -> List[str]:
        """Generate learning insights"""
        return ["Your performance is steadily improving", "You learn best in the morning"]
    
    async def _order_cards_intelligently(self, db: Session, user_id: str, cards: List[MicroCard]) -> List[MicroCard]:
        """Apply intelligent ordering to cards"""
        # Simple ordering for now - can be enhanced with AI
        return sorted(cards, key=lambda c: c.created_at)
    
    async def _calculate_improvement_rate(self, reviews: List[Review]) -> float:
        """Calculate improvement rate from reviews"""
        if len(reviews) < 2:
            return 0.0
        
        # Simple improvement calculation
        first_half = reviews[:len(reviews)//2]
        second_half = reviews[len(reviews)//2:]
        
        first_accuracy = len([r for r in first_half if r.result in [ReviewResult.EASY, ReviewResult.GOOD]]) / len(first_half)
        second_accuracy = len([r for r in second_half if r.result in [ReviewResult.EASY, ReviewResult.GOOD]]) / len(second_half)
        
        return second_accuracy - first_accuracy
    
    async def _calculate_consistency_score(self, reviews: List[Review]) -> float:
        """Calculate consistency score based on review patterns"""
        if not reviews:
            return 0.0
        
        # Calculate standard deviation of performance
        rating_map = {
            ReviewResult.AGAIN: 1,
            ReviewResult.HARD: 2,
            ReviewResult.GOOD: 3,
            ReviewResult.EASY: 4
        }
        ratings = [rating_map.get(r.result, 1) for r in reviews]
        
        if len(ratings) < 2:
            return 1.0
        
        mean_rating = sum(ratings) / len(ratings)
        variance = sum((r - mean_rating) ** 2 for r in ratings) / len(ratings)
        std_dev = variance ** 0.5
        
        # Convert to consistency score (lower std_dev = higher consistency)
        max_std_dev = 1.5  # Maximum expected standard deviation
        consistency = max(0, 1 - (std_dev / max_std_dev))
        
        return consistency
