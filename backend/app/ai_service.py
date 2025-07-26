"""
AI Learning Service
Advanced AI capabilities for personalized learning

Features:
- Content generation using LLMs
- Personalized learning path creation  
- Spaced repetition optimization
- Learning style adaptation
- Difficulty progression
- Knowledge gap analysis
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import numpy as np

# AI/ML imports
import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    AutoModelForSequenceClassification,
    pipeline, GPT2LMHeadModel, GPT2Tokenizer
)
from sentence_transformers import SentenceTransformer
import openai
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

# Local imports
from app.models import User, MicroCard, Review, DifficultyLevel, CardType
from app.database import get_db
from ml.embeddings import EmbeddingGenerator, EmbeddingConfig

logger = logging.getLogger(__name__)


@dataclass
class AIConfig:
    """AI service configuration"""
    # Model configurations
    content_model: str = "microsoft/DialoGPT-medium"
    embedding_model: str = "all-MiniLM-L6-v2"
    classification_model: str = "distilbert-base-uncased"
    
    # Generation parameters
    max_length: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    repetition_penalty: float = 1.1
    
    # Learning parameters
    difficulty_threshold: float = 0.7
    similarity_threshold: float = 0.8
    adaptation_rate: float = 0.1
    
    # OpenAI settings (if available)
    use_openai: bool = False
    openai_model: str = "gpt-3.5-turbo"


class AILearningService:
    """
    Core AI service for intelligent learning features
    """
    
    def __init__(self, config: AIConfig = None):
        self.config = config or AIConfig()
        self.is_initialized = False
        
        # AI models
        self.content_generator = None
        self.embedding_generator = None
        self.difficulty_classifier = None
        self.text_generator_pipeline = None
        
        # User models cache
        self.user_profiles = {}
        self.content_embeddings = {}
        
    async def initialize(self):
        """Initialize AI models and services"""
        logger.info("Initializing AI Learning Service...")
        
        try:
            # Initialize embedding generator
            embedding_config = EmbeddingConfig(
                model_name=self.config.embedding_model,
                batch_size=32,
                device="auto"
            )
            self.embedding_generator = EmbeddingGenerator(embedding_config)
            
            # Initialize content generation models
            await self._initialize_content_models()
            
            # Initialize classification models
            await self._initialize_classification_models()
            
            # Load user profiles and content embeddings
            await self._load_cached_data()
            
            self.is_initialized = True
            logger.info("AI Learning Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI service: {e}")
            raise
    
    async def _initialize_content_models(self):
        """Initialize content generation models"""
        if self.config.use_openai:
            # Use OpenAI API
            self.text_generator_pipeline = None
        else:
            # Use local models
            logger.info("Loading local content generation models...")
            self.text_generator_pipeline = pipeline(
                "text-generation",
                model=self.config.content_model,
                tokenizer=self.config.content_model,
                device=0 if torch.cuda.is_available() else -1
            )
    
    async def _initialize_classification_models(self):
        """Initialize classification models for difficulty, topic analysis"""
        logger.info("Loading classification models...")
        
        self.difficulty_classifier = pipeline(
            "text-classification",
            model=self.config.classification_model,
            device=0 if torch.cuda.is_available() else -1
        )
    
    async def _load_cached_data(self):
        """Load cached user profiles and content embeddings"""
        # In production, this would load from Redis or database
        self.user_profiles = {}
        self.content_embeddings = {}
    
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return self.is_initialized
    
    async def generate_microcard(
        self,
        topic: str,
        difficulty: str = "intermediate",
        learning_style: str = "visual",
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered microcard content
        
        Args:
            topic: The learning topic
            difficulty: Target difficulty level
            learning_style: User's preferred learning style
            context: Additional context for generation
            
        Returns:
            Generated microcard data
        """
        try:
            # Generate content based on topic and parameters
            if self.config.use_openai:
                content = await self._generate_with_openai(
                    topic, difficulty, learning_style, context
                )
            else:
                content = await self._generate_with_local_model(
                    topic, difficulty, learning_style, context
                )
            
            # Analyze and structure the content
            structured_content = await self._structure_content(content, learning_style)
            
            # Generate metadata
            metadata = await self._generate_metadata(topic, structured_content)
            
            return {
                "title": structured_content.get("title", topic),
                "content": structured_content.get("content", ""),
                "explanation": structured_content.get("explanation", ""),
                "examples": structured_content.get("examples", []),
                "quiz_data": structured_content.get("quiz_data", {}),
                "card_type": self._determine_card_type(structured_content),
                "difficulty": difficulty,
                "estimated_time": metadata.get("estimated_time", 3),
                "tags": metadata.get("tags", []),
                "learning_objectives": metadata.get("objectives", []),
                "ai_generated": True,
                "generation_params": {
                    "topic": topic,
                    "difficulty": difficulty,
                    "learning_style": learning_style,
                    "model_version": "v2.0"
                }
            }
            
        except Exception as e:
            logger.error(f"Content generation failed: {e}")
            raise
    
    async def _generate_with_openai(
        self, 
        topic: str, 
        difficulty: str, 
        learning_style: str, 
        context: Optional[str]
    ) -> str:
        """Generate content using OpenAI API"""
        prompt = self._build_generation_prompt(topic, difficulty, learning_style, context)
        
        response = await openai.ChatCompletion.acreate(
            model=self.config.openai_model,
            messages=[
                {"role": "system", "content": "You are an expert educational content creator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=self.config.max_length,
            temperature=self.config.temperature
        )
        
        return response.choices[0].message.content
    
    async def _generate_with_local_model(
        self, 
        topic: str, 
        difficulty: str, 
        learning_style: str, 
        context: Optional[str]
    ) -> str:
        """Generate content using local models"""
        prompt = self._build_generation_prompt(topic, difficulty, learning_style, context)
        
        generated = self.text_generator_pipeline(
            prompt,
            max_length=self.config.max_length,
            temperature=self.config.temperature,
            top_p=self.config.top_p,
            repetition_penalty=self.config.repetition_penalty,
            do_sample=True,
            pad_token_id=50256
        )
        
        return generated[0]["generated_text"]
    
    def _build_generation_prompt(
        self, 
        topic: str, 
        difficulty: str, 
        learning_style: str, 
        context: Optional[str]
    ) -> str:
        """Build prompt for content generation"""
        prompt = f"""Create educational content for the topic: {topic}

Difficulty Level: {difficulty}
Learning Style: {learning_style}
{f"Context: {context}" if context else ""}

Generate a comprehensive microlearning card that includes:
1. Clear explanation of the concept
2. Practical examples
3. Key takeaways
4. Optional quiz question

Format the response as structured content suitable for microlearning.
"""
        return prompt
    
    async def _structure_content(self, raw_content: str, learning_style: str) -> Dict[str, Any]:
        """Structure generated content into components"""
        # Parse and structure the generated content
        # This would include NLP processing to extract sections
        
        structured = {
            "title": self._extract_title(raw_content),
            "content": self._extract_main_content(raw_content),
            "explanation": self._extract_explanation(raw_content),
            "examples": self._extract_examples(raw_content),
            "quiz_data": self._extract_quiz_data(raw_content)
        }
        
        # Adapt based on learning style
        if learning_style == "visual":
            structured["content"] = self._add_visual_elements(structured["content"])
        elif learning_style == "interactive":
            structured["quiz_data"] = self._enhance_interactivity(structured["quiz_data"])
        
        return structured
    
    async def _generate_metadata(self, topic: str, content: Dict[str, Any]) -> Dict[str, Any]:
        """Generate metadata for the content"""
        # Estimate reading time
        word_count = len(content.get("content", "").split())
        estimated_time = max(1, word_count // 50)  # Rough estimate
        
        # Generate tags using embeddings
        content_text = content.get("content", "")
        if content_text:
            embedding = self.embedding_generator.generate_embeddings([content_text])[0]
            tags = await self._generate_tags_from_embedding(embedding, topic)
        else:
            tags = [topic.lower()]
        
        # Generate learning objectives
        objectives = self._extract_learning_objectives(content)
        
        return {
            "estimated_time": estimated_time,
            "tags": tags,
            "objectives": objectives
        }
    
    async def create_personalized_path(
        self,
        user_id: str,
        topic: str,
        skill_level: str = "beginner",
        goals: List[str] = None,
        time_commitment: int = 30  # minutes per day
    ) -> Dict[str, Any]:
        """
        Create personalized learning path using AI
        
        Args:
            user_id: User identifier
            topic: Main learning topic
            skill_level: Current skill level
            goals: Learning goals
            time_commitment: Daily time commitment in minutes
            
        Returns:
            Personalized learning path structure
        """
        try:
            # Get user profile and learning history
            user_profile = await self._get_user_profile(user_id)
            
            # Analyze topic and break down into subtopics
            subtopics = await self._analyze_topic_structure(topic, skill_level)
            
            # Generate progression sequence
            progression = await self._create_learning_progression(
                subtopics, user_profile, time_commitment
            )
            
            # Create timeline and milestones
            timeline = self._create_learning_timeline(progression, time_commitment)
            
            return {
                "path_id": f"ai_path_{user_id}_{int(datetime.now().timestamp())}",
                "title": f"Personalized {topic} Learning Path",
                "description": f"AI-generated learning path for {topic}",
                "skill_level": skill_level,
                "estimated_duration_days": timeline["total_days"],
                "daily_time_minutes": time_commitment,
                "subtopics": subtopics,
                "progression": progression,
                "timeline": timeline,
                "goals": goals or [],
                "adaptive_features": {
                    "difficulty_adjustment": True,
                    "pace_optimization": True,
                    "content_personalization": True
                },
                "created_at": datetime.utcnow().isoformat(),
                "ai_generated": True
            }
            
        except Exception as e:
            logger.error(f"Personalized path creation failed: {e}")
            raise
    
    async def optimize_spaced_repetition(
        self, 
        db, 
        user_id: str
    ) -> Dict[str, Any]:
        """
        AI-optimized spaced repetition scheduling
        
        Args:
            db: Database session
            user_id: User identifier
            
        Returns:
            Optimized review schedule
        """
        try:
            # Get user's review history
            reviews = await self._get_user_reviews(db, user_id)
            
            # Analyze performance patterns
            performance_analysis = self._analyze_performance_patterns(reviews)
            
            # Get current due cards
            due_cards = await self._get_due_cards(db, user_id)
            
            # Optimize scheduling using AI
            optimized_schedule = await self._optimize_schedule(
                due_cards, performance_analysis
            )
            
            return {
                "optimized_schedule": optimized_schedule,
                "performance_insights": performance_analysis,
                "recommendations": await self._generate_study_recommendations(
                    performance_analysis
                ),
                "total_due_cards": len(due_cards),
                "estimated_review_time": self._estimate_review_time(optimized_schedule),
                "next_optimal_session": self._calculate_next_session_time(
                    performance_analysis
                )
            }
            
        except Exception as e:
            logger.error(f"Schedule optimization failed: {e}")
            raise
    
    async def create_study_session(
        self,
        db,
        user_id: str,
        duration_minutes: int,
        focus_areas: List[str] = None,
        session_type: str = "mixed"
    ) -> Dict[str, Any]:
        """
        Create AI-optimized study session
        
        Args:
            db: Database session
            user_id: User identifier
            duration_minutes: Session duration
            focus_areas: Optional focus areas
            session_type: Type of session (review, new, mixed)
            
        Returns:
            Optimized study session plan
        """
        try:
            # Get user profile and current state
            user_profile = await self._get_user_profile(user_id)
            
            # Determine optimal content mix
            content_plan = await self._plan_session_content(
                db, user_id, duration_minutes, focus_areas, session_type
            )
            
            # Create session structure
            session_structure = await self._structure_study_session(
                content_plan, duration_minutes, user_profile
            )
            
            return {
                "session_id": f"session_{user_id}_{int(datetime.now().timestamp())}",
                "duration_minutes": duration_minutes,
                "session_type": session_type,
                "content_plan": content_plan,
                "structure": session_structure,
                "adaptive_features": {
                    "difficulty_monitoring": True,
                    "fatigue_detection": True,
                    "engagement_optimization": True
                },
                "estimated_cards": len(content_plan.get("cards", [])),
                "break_suggestions": self._calculate_break_intervals(duration_minutes),
                "success_metrics": self._define_session_metrics()
            }
            
        except Exception as e:
            logger.error(f"Study session creation failed: {e}")
            raise
    
    async def update_user_model(self, user_id: str, interaction_data: Dict[str, Any]):
        """
        Update user model with new interaction data
        
        Args:
            user_id: User identifier
            interaction_data: Recent interaction/review data
        """
        try:
            # Update user profile in cache
            if user_id not in self.user_profiles:
                self.user_profiles[user_id] = await self._initialize_user_profile(user_id)
            
            # Process interaction data
            profile_updates = self._process_interaction_data(interaction_data)
            
            # Update user profile
            self.user_profiles[user_id].update(profile_updates)
            
            # Trigger adaptive adjustments if needed
            await self._check_adaptation_triggers(user_id)
            
        except Exception as e:
            logger.error(f"User model update failed: {e}")
    
    # Helper methods
    def _extract_title(self, content: str) -> str:
        """Extract title from generated content"""
        lines = content.split('\n')
        for line in lines:
            if line.strip() and not line.startswith('#'):
                return line.strip()[:100]
        return "Generated Content"
    
    def _extract_main_content(self, content: str) -> str:
        """Extract main content"""
        # Simple extraction - in production would use more sophisticated NLP
        return content[:1000]
    
    def _extract_explanation(self, content: str) -> str:
        """Extract explanation section"""
        return content[:500]
    
    def _extract_examples(self, content: str) -> List[str]:
        """Extract examples from content"""
        # Simple example extraction
        return []
    
    def _extract_quiz_data(self, content: str) -> Dict[str, Any]:
        """Extract quiz data if present"""
        return {}
    
    def _determine_card_type(self, content: Dict[str, Any]) -> str:
        """Determine optimal card type based on content"""
        if content.get("quiz_data"):
            return CardType.QUIZ.value
        else:
            return CardType.CONCEPT.value
    
    def _add_visual_elements(self, content: str) -> str:
        """Add visual elements for visual learners"""
        return content
    
    def _enhance_interactivity(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance interactivity for interactive learners"""
        return quiz_data
    
    async def _generate_tags_from_embedding(self, embedding: np.ndarray, topic: str) -> List[str]:
        """Generate tags using embedding similarity"""
        return [topic.lower(), "ai-generated"]
    
    def _extract_learning_objectives(self, content: Dict[str, Any]) -> List[str]:
        """Extract learning objectives from content"""
        return ["Understand core concepts", "Apply knowledge practically"]
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up AI Learning Service...")
        self.is_initialized = False
