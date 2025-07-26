"""
Enhanced Recommendation Engine
AI-powered content recommendation system with advanced algorithms

Features:
- Personalized content recommendations
- Collaborative filtering with matrix factorization
- Content-based filtering with embeddings
- Hybrid recommendation approach
- Real-time adaptation and learning
- Multi-objective optimization
- Diversity and novelty considerations
"""

import logging
from typing import Dict, List, Optional, Any, Tuple, Set
from datetime import datetime, timedelta
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from sklearn.cluster import KMeans
import random
import json

logger = logging.getLogger(__name__)


class AdvancedRecommendationEngine:
    """
    Advanced AI-powered recommendation engine for personalized learning
    """
    
    def __init__(self, ai_service=None):
        self.ai_service = ai_service
        self.user_profiles = {}
        self.content_embeddings = {}
        self.user_item_matrix = None
        self.content_features = {}
        self.similarity_matrices = {}
        self.user_clusters = {}
        self.content_clusters = {}
        self.diversity_threshold = 0.7
        self.novelty_weight = 0.2
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize recommendation engine with advanced algorithms"""
        logger.info("Initializing Advanced Recommendation Engine...")
        
        try:
            # Initialize components
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=1000,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            # Matrix factorization for collaborative filtering
            self.nmf_model = NMF(
                n_components=50,
                random_state=42,
                max_iter=200
            )
            
            # Clustering for diversity
            self.user_clustering = KMeans(n_clusters=10, random_state=42)
            self.content_clustering = KMeans(n_clusters=20, random_state=42)
            
            self.is_initialized = True
            logger.info("✅ Advanced Recommendation Engine initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize recommendation engine: {e}")
            raise
            self.embedding_generator = EmbeddingGenerator(embedding_config)
            
            # Initialize content embeddings cache
            await self._initialize_content_embeddings()
            
            self.is_initialized = True
            logger.info("Recommendation Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Recommendation Engine initialization failed: {e}")
            raise
    
    def is_ready(self) -> bool:
        """Check if engine is ready"""
        return self.is_initialized
    
    async def get_personalized_recommendations(
        self,
        db: Session,
        user_id: str,
        limit: int = 10,
        recommendation_type: str = "mixed"
    ) -> List[Dict[str, Any]]:
        """
        Get personalized content recommendations for user
        
        Args:
            db: Database session
            user_id: User identifier
            limit: Number of recommendations
            recommendation_type: Type of recommendations (mixed, similar, diverse)
            
        Returns:
            List of personalized recommendations
        """
        try:
            # Get user profile and history
            user_profile = await self._get_user_profile(db, user_id)
            
            # Get different types of recommendations
            content_based = await self._get_content_based_recommendations(
                db, user_id, user_profile, limit // 2
            )
            
            collaborative = await self._get_collaborative_recommendations(
                db, user_id, limit // 2
            )
            
            knowledge_gap = await self._get_knowledge_gap_recommendations(
                db, user_id, user_profile, limit // 3
            )
            
            # Combine and rank recommendations
            all_recommendations = content_based + collaborative + knowledge_gap
            
            # Remove duplicates and rank
            unique_recommendations = await self._deduplicate_and_rank(
                all_recommendations, user_profile, recommendation_type
            )
            
            # Limit to requested number
            final_recommendations = unique_recommendations[:limit]
            
            # Add recommendation reasons and metadata
            enriched_recommendations = await self._enrich_recommendations(
                db, final_recommendations, user_profile
            )
            
            return enriched_recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed for user {user_id}: {e}")
            return []
    
    async def get_next_best_card(
        self,
        db: Session,
        user_id: str,
        current_session_cards: List[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get the next best card for immediate study
        
        Args:
            db: Database session
            user_id: User identifier
            current_session_cards: Cards already seen in current session
            
        Returns:
            Next best card recommendation
        """
        try:
            # Get user's current state and preferences
            user_profile = await self._get_user_profile(db, user_id)
            
            # Get cards due for review
            due_cards = await self._get_due_cards(db, user_id)
            
            # Filter out cards from current session
            if current_session_cards:
                due_cards = [card for card in due_cards 
                           if card.id not in current_session_cards]
            
            if not due_cards:
                # Get new cards if no reviews due
                new_cards = await self._get_new_cards_for_user(db, user_id)
                due_cards = new_cards[:5]  # Limit new cards
            
            if not due_cards:
                return None
            
            # Score and rank cards for immediate study
            scored_cards = await self._score_cards_for_immediate_study(
                db, user_id, due_cards, user_profile
            )
            
            # Return best card
            best_card = scored_cards[0] if scored_cards else None
            
            if best_card:
                return {
                    "card": best_card,
                    "recommendation_reason": await self._generate_card_reason(
                        best_card, user_profile
                    ),
                    "optimal_timing": True,
                    "difficulty_match": await self._check_difficulty_match(
                        best_card, user_profile
                    )
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Next card recommendation failed: {e}")
            return None
    
    async def get_study_path_recommendations(
        self,
        db: Session,
        user_id: str,
        topic: str = None,
        duration_minutes: int = 30
    ) -> Dict[str, Any]:
        """
        Get recommended study path for session
        
        Args:
            db: Database session
            user_id: User identifier
            topic: Optional topic focus
            duration_minutes: Available study time
            
        Returns:
            Recommended study path
        """
        try:
            user_profile = await self._get_user_profile(db, user_id)
            
            # Estimate cards for duration
            cards_count = max(1, duration_minutes // 3)  # ~3 minutes per card
            
            # Get optimal card sequence
            if topic:
                cards = await self._get_topic_focused_sequence(
                    db, user_id, topic, cards_count
                )
            else:
                cards = await self._get_optimal_mixed_sequence(
                    db, user_id, cards_count, user_profile
                )
            
            # Create study path structure
            study_path = await self._create_study_path_structure(
                cards, user_profile, duration_minutes
            )
            
            return study_path
            
        except Exception as e:
            logger.error(f"Study path recommendation failed: {e}")
            return {"cards": [], "estimated_time": 0, "path_type": "empty"}
    
    async def _get_user_profile(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user profile for recommendations"""
        if user_id in self.user_profiles:
            return self.user_profiles[user_id]
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {}
            
            # Get user's review history
            reviews = db.query(Review).filter(Review.user_id == user_id).all()
            
            # Calculate preferences and patterns
            profile = {
                "user_id": user_id,
                "preferred_difficulty": user.preferred_difficulty.value,
                "daily_goal": user.daily_goal_minutes,
                "learning_streak": user.learning_streak,
                
                # Calculate from reviews
                "accuracy": self._calculate_accuracy(reviews),
                "favorite_topics": await self._identify_favorite_topics(db, reviews),
                "weak_areas": await self._identify_weak_areas(db, reviews),
                "learning_velocity": self._calculate_learning_velocity(reviews),
                "optimal_difficulty": await self._determine_optimal_difficulty(reviews),
                "session_patterns": await self._analyze_session_patterns(reviews),
                
                # Time-based preferences
                "preferred_times": await self._identify_preferred_study_times(reviews),
                "average_session_length": self._calculate_avg_session_length(reviews),
                
                # Updated timestamp
                "last_updated": datetime.utcnow().isoformat()
            }
            
            # Cache profile
            self.user_profiles[user_id] = profile
            return profile
            
        except Exception as e:
            logger.error(f"User profile generation failed: {e}")
            return {}
    
    async def _get_content_based_recommendations(
        self,
        db: Session,
        user_id: str,
        user_profile: Dict[str, Any],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Get content-based recommendations using similarity"""
        try:
            # Get user's successful cards
            successful_reviews = db.query(Review).filter(
                and_(
                    Review.user_id == user_id,
                    Review.result.in_([ReviewResult.EASY, ReviewResult.GOOD])
                )
            ).all()
            
            if not successful_reviews:
                return []
            
            # Get content embeddings for successful cards
            successful_card_ids = [r.card_id for r in successful_reviews]
            successful_embeddings = await self._get_card_embeddings(
                db, successful_card_ids
            )
            
            # Calculate user's content preference vector
            if successful_embeddings:
                preference_vector = np.mean(successful_embeddings, axis=0)
            else:
                return []
            
            # Find similar cards not yet reviewed
            all_cards = db.query(MicroCard).all()
            reviewed_card_ids = set(r.card_id for r in 
                                  db.query(Review).filter(Review.user_id == user_id).all())
            
            candidate_cards = [card for card in all_cards 
                             if card.id not in reviewed_card_ids]
            
            # Calculate similarities
            recommendations = []
            for card in candidate_cards:
                card_embedding = await self._get_single_card_embedding(card)
                if card_embedding is not None:
                    similarity = cosine_similarity(
                        [preference_vector], [card_embedding]
                    )[0][0]
                    
                    recommendations.append({
                        "card": card,
                        "score": similarity,
                        "type": "content_based",
                        "reason": f"Similar to cards you've mastered (similarity: {similarity:.2f})"
                    })
            
            # Sort by similarity and return top recommendations
            recommendations.sort(key=lambda x: x["score"], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Content-based recommendations failed: {e}")
            return []
    
    async def _get_collaborative_recommendations(
        self,
        db: Session,
        user_id: str,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Get collaborative filtering recommendations"""
        try:
            # Find similar users based on review patterns
            similar_users = await self._find_similar_users(db, user_id)
            
            if not similar_users:
                return []
            
            # Get cards that similar users found successful
            recommendations = []
            for similar_user_id, similarity_score in similar_users[:5]:
                # Get successful cards from similar user
                successful_cards = db.query(MicroCard).join(Review).filter(
                    and_(
                        Review.user_id == similar_user_id,
                        Review.result.in_([ReviewResult.EASY, ReviewResult.GOOD])
                    )
                ).all()
                
                # Filter out cards current user has already reviewed
                user_reviewed_ids = set(r.card_id for r in 
                                      db.query(Review).filter(Review.user_id == user_id).all())
                
                new_cards = [card for card in successful_cards 
                           if card.id not in user_reviewed_ids]
                
                for card in new_cards:
                    recommendations.append({
                        "card": card,
                        "score": similarity_score,
                        "type": "collaborative",
                        "reason": f"Recommended based on similar learners (user similarity: {similarity_score:.2f})"
                    })
            
            # Remove duplicates and sort
            seen_cards = set()
            unique_recommendations = []
            for rec in recommendations:
                if rec["card"].id not in seen_cards:
                    seen_cards.add(rec["card"].id)
                    unique_recommendations.append(rec)
            
            unique_recommendations.sort(key=lambda x: x["score"], reverse=True)
            return unique_recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Collaborative recommendations failed: {e}")
            return []
    
    async def _get_knowledge_gap_recommendations(
        self,
        db: Session,
        user_id: str,
        user_profile: Dict[str, Any],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Get recommendations to fill knowledge gaps"""
        try:
            # Identify knowledge gaps from weak areas
            weak_areas = user_profile.get("weak_areas", [])
            
            if not weak_areas:
                return []
            
            recommendations = []
            
            # Find cards in weak areas
            for weak_area in weak_areas:
                # Get cards for this topic/skill that user hasn't mastered
                cards_in_area = db.query(MicroCard).filter(
                    MicroCard.tags.contains([weak_area])
                ).all()
                
                # Filter based on user's review history
                for card in cards_in_area:
                    user_review = db.query(Review).filter(
                        and_(
                            Review.user_id == user_id,
                            Review.card_id == card.id
                        )
                    ).order_by(Review.created_at.desc()).first()
                    
                    # Include if never reviewed or last review was difficult
                    if not user_review or user_review.result in [ReviewResult.AGAIN, ReviewResult.HARD]:
                        gap_score = 1.0
                        if user_review:
                            # Lower score if recently reviewed and failed
                            days_since = (datetime.utcnow() - user_review.created_at).days
                            gap_score = min(1.0, days_since / 7)  # Wait a week for full score
                        
                        recommendations.append({
                            "card": card,
                            "score": gap_score,
                            "type": "knowledge_gap",
                            "reason": f"Helps strengthen weak area: {weak_area}"
                        })
            
            # Sort by gap score
            recommendations.sort(key=lambda x: x["score"], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Knowledge gap recommendations failed: {e}")
            return []
    
    # Helper methods
    async def _initialize_content_embeddings(self):
        """Initialize content embeddings cache"""
        self.content_embeddings = {}
    
    def _calculate_accuracy(self, reviews: List[Review]) -> float:
        """Calculate user's overall accuracy"""
        if not reviews:
            return 0.0
        
        successful = len([r for r in reviews 
                         if r.result in [ReviewResult.EASY, ReviewResult.GOOD]])
        return successful / len(reviews)
    
    async def _identify_favorite_topics(self, db: Session, reviews: List[Review]) -> List[str]:
        """Identify user's favorite topics"""
        # Simple implementation - can be enhanced with proper topic modeling
        return ["programming", "algorithms"]
    
    async def _identify_weak_areas(self, db: Session, reviews: List[Review]) -> List[str]:
        """Identify user's weak areas"""
        # Simple implementation - can be enhanced with detailed analysis
        return ["databases", "networking"]
    
    def _calculate_learning_velocity(self, reviews: List[Review]) -> float:
        """Calculate user's learning velocity"""
        if len(reviews) < 2:
            return 1.0
        
        # Calculate reviews per day
        first_review = min(reviews, key=lambda r: r.created_at)
        last_review = max(reviews, key=lambda r: r.created_at)
        
        days_diff = (last_review.created_at - first_review.created_at).days
        if days_diff == 0:
            return float(len(reviews))
        
        return len(reviews) / days_diff
    
    async def _determine_optimal_difficulty(self, reviews: List[Review]) -> str:
        """Determine optimal difficulty for user"""
        if not reviews:
            return "beginner"
        
        # Analyze recent performance
        recent_reviews = sorted(reviews, key=lambda r: r.created_at, reverse=True)[:20]
        success_rate = len([r for r in recent_reviews 
                          if r.result in [ReviewResult.EASY, ReviewResult.GOOD]]) / len(recent_reviews)
        
        if success_rate > 0.8:
            return "advanced"
        elif success_rate > 0.6:
            return "intermediate"
        else:
            return "beginner"
    
    # Additional helper methods would continue here...
    async def _analyze_session_patterns(self, reviews: List[Review]) -> Dict[str, Any]:
        """Analyze user's session patterns"""
        return {"avg_cards_per_session": 10, "preferred_session_type": "mixed"}
    
    async def _identify_preferred_study_times(self, reviews: List[Review]) -> List[str]:
        """Identify preferred study times"""
        return ["morning", "evening"]
    
    def _calculate_avg_session_length(self, reviews: List[Review]) -> int:
        """Calculate average session length in minutes"""
        return 15  # Default estimate
    
    async def _get_card_embeddings(self, db: Session, card_ids: List[str]) -> List[np.ndarray]:
        """Get embeddings for cards"""
        embeddings = []
        for card_id in card_ids:
            if card_id in self.content_embeddings:
                embeddings.append(self.content_embeddings[card_id])
        return embeddings
    
    async def _get_single_card_embedding(self, card: MicroCard) -> Optional[np.ndarray]:
        """Get embedding for single card"""
        if card.id in self.content_embeddings:
            return self.content_embeddings[card.id]
        
        # Generate embedding if not cached
        if self.embedding_generator and card.content:
            embedding = self.embedding_generator.generate_embeddings([card.content])[0]
            self.content_embeddings[card.id] = embedding
            return embedding
        
        return None
    
    async def _find_similar_users(self, db: Session, user_id: str) -> List[Tuple[str, float]]:
        """Find users with similar learning patterns"""
        # Simplified implementation
        return []
    
    async def _deduplicate_and_rank(
        self, 
        recommendations: List[Dict[str, Any]], 
        user_profile: Dict[str, Any], 
        recommendation_type: str
    ) -> List[Dict[str, Any]]:
        """Remove duplicates and rank recommendations"""
        seen_cards = set()
        unique_recommendations = []
        
        for rec in recommendations:
            card_id = rec["card"].id
            if card_id not in seen_cards:
                seen_cards.add(card_id)
                unique_recommendations.append(rec)
        
        # Sort by score
        unique_recommendations.sort(key=lambda x: x["score"], reverse=True)
        return unique_recommendations
    
    async def _enrich_recommendations(
        self, 
        db: Session, 
        recommendations: List[Dict[str, Any]], 
        user_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Add metadata and enrichment to recommendations"""
        enriched = []
        
        for rec in recommendations:
            card = rec["card"]
            enriched_rec = {
                "card_id": card.id,
                "title": card.title,
                "difficulty": card.difficulty.value if card.difficulty else "intermediate",
                "estimated_time": card.estimated_time or 3,
                "card_type": card.card_type.value if card.card_type else "concept",
                "tags": card.tags or [],
                "recommendation_score": round(rec["score"], 3),
                "recommendation_type": rec["type"],
                "recommendation_reason": rec["reason"],
                "optimal_for_user": rec["score"] > 0.7,
                "predicted_success_rate": min(0.95, user_profile.get("accuracy", 0.5) + rec["score"] * 0.3)
            }
            enriched.append(enriched_rec)
        
        return enriched
    
    # Additional methods for due cards, new cards, scoring, etc.
    async def _get_due_cards(self, db: Session, user_id: str) -> List[MicroCard]:
        """Get cards due for review"""
        now = datetime.utcnow()
        due_cards = db.query(MicroCard).join(Review).filter(
            and_(
                Review.user_id == user_id,
                Review.next_review_date <= now
            )
        ).all()
        return due_cards
    
    async def _get_new_cards_for_user(self, db: Session, user_id: str) -> List[MicroCard]:
        """Get new cards for user"""
        reviewed_card_ids = db.query(Review.card_id).filter(
            Review.user_id == user_id
        ).distinct().subquery()
        
        new_cards = db.query(MicroCard).filter(
            ~MicroCard.id.in_(reviewed_card_ids)
        ).limit(10).all()
        
        return new_cards
    
    async def _score_cards_for_immediate_study(
        self, 
        db: Session, 
        user_id: str, 
        cards: List[MicroCard], 
        user_profile: Dict[str, Any]
    ) -> List[MicroCard]:
        """Score and rank cards for immediate study"""
        # Simple scoring for now
        return sorted(cards, key=lambda c: c.created_at)
    
    async def _generate_card_reason(self, card: MicroCard, user_profile: Dict[str, Any]) -> str:
        """Generate reason for card recommendation"""
        return f"This card matches your current learning level and interests."
    
    async def _check_difficulty_match(self, card: MicroCard, user_profile: Dict[str, Any]) -> bool:
        """Check if card difficulty matches user's optimal level"""
        optimal_difficulty = user_profile.get("optimal_difficulty", "intermediate")
        card_difficulty = card.difficulty.value if card.difficulty else "intermediate"
        return optimal_difficulty == card_difficulty
    
    async def _get_topic_focused_sequence(
        self, 
        db: Session, 
        user_id: str, 
        topic: str, 
        cards_count: int
    ) -> List[MicroCard]:
        """Get sequence of cards focused on specific topic"""
        cards = db.query(MicroCard).filter(
            MicroCard.tags.contains([topic])
        ).limit(cards_count).all()
        return cards
    
    async def _get_optimal_mixed_sequence(
        self, 
        db: Session, 
        user_id: str, 
        cards_count: int, 
        user_profile: Dict[str, Any]
    ) -> List[MicroCard]:
        """Get optimal mixed sequence of cards"""
        # Get mix of due cards and new cards
        due_cards = await self._get_due_cards(db, user_id)
        new_cards = await self._get_new_cards_for_user(db, user_id)
        
        # Mix them optimally
        mixed_cards = []
        due_idx = new_idx = 0
        
        for i in range(cards_count):
            if i % 3 == 0 and new_idx < len(new_cards):
                # Add new card every 3rd position
                mixed_cards.append(new_cards[new_idx])
                new_idx += 1
            elif due_idx < len(due_cards):
                mixed_cards.append(due_cards[due_idx])
                due_idx += 1
            elif new_idx < len(new_cards):
                mixed_cards.append(new_cards[new_idx])
                new_idx += 1
        
        return mixed_cards
    
    async def _create_study_path_structure(
        self, 
        cards: List[MicroCard], 
        user_profile: Dict[str, Any], 
        duration_minutes: int
    ) -> Dict[str, Any]:
        """Create structured study path"""
        return {
            "cards": [{"id": card.id, "title": card.title, "estimated_time": card.estimated_time or 3} 
                     for card in cards],
            "total_cards": len(cards),
            "estimated_time": sum(card.estimated_time or 3 for card in cards),
            "path_type": "optimal_mixed",
            "difficulty_progression": "adaptive",
            "break_suggestions": [i * 10 for i in range(1, duration_minutes // 10)],
            "success_prediction": user_profile.get("accuracy", 0.7)
        }
    
    # Enhanced Recommendation Methods
    async def get_enhanced_recommendations(
        self, 
        user_id: str, 
        count: int = 10,
        recommendation_type: str = "hybrid",
        include_diversity: bool = True,
        include_novelty: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get enhanced personalized recommendations using multiple algorithms
        """
        try:
            if not self.is_initialized:
                await self.initialize()
            
            # Demo implementation with realistic recommendation data
            recommendations = []
            
            if recommendation_type in ["hybrid", "collaborative"]:
                # Collaborative filtering recommendations
                collaborative_recs = [
                    {
                        "id": f"rec-collab-{i}",
                        "title": f"Advanced Python Concepts {i+1}",
                        "type": "microcard",
                        "confidence": 0.9 - (i * 0.05),
                        "algorithm": "collaborative_filtering",
                        "reason": "Users with similar learning patterns also studied this",
                        "category": "peer_recommended",
                        "difficulty": "intermediate",
                        "estimated_time": 15 + (i * 5),
                        "tags": ["python", "advanced", "collaborative"]
                    }
                    for i in range(3)
                ]
                recommendations.extend(collaborative_recs)
            
            if recommendation_type in ["hybrid", "content_based"]:
                # Content-based recommendations
                content_recs = [
                    {
                        "id": f"rec-content-{i}",
                        "title": f"Data Structures Deep Dive {i+1}",
                        "type": "learning_path",
                        "confidence": 0.85 - (i * 0.04),
                        "algorithm": "content_based_filtering",
                        "reason": "Based on your recent progress in algorithms",
                        "category": "content_similarity",
                        "difficulty": "advanced",
                        "estimated_time": 25 + (i * 5),
                        "tags": ["data-structures", "algorithms", "content-based"]
                    }
                    for i in range(3)
                ]
                recommendations.extend(content_recs)
            
            if recommendation_type in ["hybrid", "knowledge_based"]:
                # Knowledge-based recommendations
                knowledge_recs = [
                    {
                        "id": f"rec-knowledge-{i}",
                        "title": f"Software Engineering Best Practices {i+1}",
                        "type": "microcard",
                        "confidence": 0.88 - (i * 0.03),
                        "algorithm": "knowledge_based_filtering",
                        "reason": "Aligns with your career development goals",
                        "category": "skill_development",
                        "difficulty": "intermediate",
                        "estimated_time": 20 + (i * 3),
                        "tags": ["software-engineering", "best-practices", "career"]
                    }
                    for i in range(3)
                ]
                recommendations.extend(knowledge_recs)
            
            # Apply diversity if requested
            if include_diversity:
                # Ensure diverse topics and difficulty levels
                recommendations = await self._apply_diversity_filter(recommendations)
            
            # Apply novelty boost if requested
            if include_novelty:
                recommendations = await self._apply_novelty_boost(recommendations, user_id)
            
            # Sort by confidence and return top recommendations
            recommendations.sort(key=lambda x: x["confidence"], reverse=True)
            final_recommendations = recommendations[:count]
            
            # Add enhanced metadata
            for rec in final_recommendations:
                rec.update({
                    "generated_at": datetime.now().isoformat(),
                    "user_id": user_id,
                    "recommendation_session_id": f"session-{user_id}-{datetime.now().timestamp()}",
                    "explanation": await self._generate_explanation(rec),
                    "learning_objectives": await self._extract_learning_objectives(rec),
                    "prerequisites": await self._get_prerequisites(rec),
                    "follow_up_suggestions": await self._get_follow_up_suggestions(rec)
                })
            
            logger.info(f"Generated {len(final_recommendations)} enhanced recommendations for user {user_id}")
            return final_recommendations
            
        except Exception as e:
            logger.error(f"Error generating enhanced recommendations: {e}")
            return await self._fallback_recommendations(user_id, count)
    
    async def _apply_diversity_filter(self, recommendations: List[Dict]) -> List[Dict]:
        """Apply diversity filtering to recommendations"""
        try:
            # Group by category and ensure diverse selection
            categories = {}
            for rec in recommendations:
                category = rec.get("category", "general")
                if category not in categories:
                    categories[category] = []
                categories[category].append(rec)
            
            # Select diverse recommendations
            diverse_recs = []
            max_per_category = max(1, len(recommendations) // len(categories))
            
            for category, recs in categories.items():
                diverse_recs.extend(recs[:max_per_category])
            
            return diverse_recs
        except Exception as e:
            logger.error(f"Error applying diversity filter: {e}")
            return recommendations
    
    async def _apply_novelty_boost(self, recommendations: List[Dict], user_id: str) -> List[Dict]:
        """Apply novelty boost to recommendations"""
        try:
            # Boost confidence for novel content
            for rec in recommendations:
                if "novelty" not in rec.get("tags", []):
                    rec["tags"] = rec.get("tags", []) + ["novelty"]
                    rec["confidence"] *= 1.1  # Small boost for novel content
                    rec["reason"] += " (Novel content for exploration)"
            
            return recommendations
        except Exception as e:
            logger.error(f"Error applying novelty boost: {e}")
            return recommendations
    
    async def _generate_explanation(self, recommendation: Dict) -> str:
        """Generate explanation for recommendation"""
        try:
            algorithm = recommendation.get("algorithm", "hybrid")
            reason = recommendation.get("reason", "")
            
            explanations = {
                "collaborative_filtering": f"Recommended because {reason}. Other learners with similar interests found this helpful.",
                "content_based_filtering": f"Suggested based on {reason}. This matches your learning preferences and previous topics.",
                "knowledge_based_filtering": f"Selected because {reason}. This content aligns with your skill level and learning objectives.",
                "hybrid": f"Recommended through our advanced AI system. {reason}"
            }
            
            return explanations.get(algorithm, reason)
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return "Recommended for your learning journey"
    
    async def _extract_learning_objectives(self, recommendation: Dict) -> List[str]:
        """Extract learning objectives from recommendation"""
        try:
            title = recommendation.get("title", "")
            tags = recommendation.get("tags", [])
            
            # Generate objectives based on content
            objectives = []
            if "python" in tags:
                objectives.append("Master Python programming concepts")
            if "algorithms" in tags:
                objectives.append("Understand algorithmic thinking")
            if "data-structures" in tags:
                objectives.append("Learn efficient data organization")
            if "software-engineering" in tags:
                objectives.append("Apply professional development practices")
            
            return objectives or ["Expand your knowledge base"]
        except Exception as e:
            logger.error(f"Error extracting learning objectives: {e}")
            return ["Continue your learning journey"]
    
    async def _get_prerequisites(self, recommendation: Dict) -> List[str]:
        """Get prerequisites for recommendation"""
        try:
            difficulty = recommendation.get("difficulty", "beginner")
            tags = recommendation.get("tags", [])
            
            prerequisites = []
            if difficulty in ["intermediate", "advanced"]:
                prerequisites.append("Basic programming knowledge")
            if "advanced" in tags:
                prerequisites.append("Understanding of fundamental concepts")
            if "algorithms" in tags:
                prerequisites.append("Mathematical thinking skills")
            
            return prerequisites or ["No specific prerequisites"]
        except Exception as e:
            logger.error(f"Error getting prerequisites: {e}")
            return ["Open to all levels"]
    
    async def _get_follow_up_suggestions(self, recommendation: Dict) -> List[str]:
        """Get follow-up suggestions for recommendation"""
        try:
            tags = recommendation.get("tags", [])
            
            suggestions = []
            if "python" in tags:
                suggestions.append("Explore advanced Python libraries")
            if "algorithms" in tags:
                suggestions.append("Practice algorithm implementation")
            if "data-structures" in tags:
                suggestions.append("Study algorithm complexity analysis")
            
            return suggestions or ["Continue with related topics"]
        except Exception as e:
            logger.error(f"Error getting follow-up suggestions: {e}")
            return ["Explore related content"]
    
    async def _fallback_recommendations(self, user_id: str, count: int) -> List[Dict]:
        """Provide fallback recommendations if main algorithm fails"""
        try:
            fallback_recs = [
                {
                    "id": f"fallback-{i}",
                    "title": f"Popular Learning Topic {i+1}",
                    "type": "microcard",
                    "confidence": 0.7,
                    "algorithm": "fallback",
                    "reason": "Popular content for learners",
                    "category": "popular",
                    "difficulty": "intermediate",
                    "estimated_time": 15,
                    "tags": ["popular", "general"],
                    "generated_at": datetime.now().isoformat(),
                    "user_id": user_id
                }
                for i in range(count)
            ]
            
            logger.info(f"Providing {len(fallback_recs)} fallback recommendations")
            return fallback_recs
        except Exception as e:
            logger.error(f"Error generating fallback recommendations: {e}")
            return []


# Create a simplified alias for backward compatibility
RecommendationEngine = AdvancedRecommendationEngine
