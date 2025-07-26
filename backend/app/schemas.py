"""
Pydantic Schemas for API Request/Response Models
Type-safe data validation and serialization

Features:
- Request/response validation
- Automatic documentation
- Type safety
- Data transformation
"""

from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator, Field
from enum import Enum


# Base schemas
class TimestampMixin(BaseModel):
    """Mixin for timestamp fields"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Enums
class DifficultyEnum(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CardTypeEnum(str, Enum):
    CONCEPT = "concept"
    QUIZ = "quiz"
    DRILL = "drill"
    VIDEO = "video"
    INTERACTIVE = "interactive"


class ReviewResultEnum(str, Enum):
    EASY = "easy"
    GOOD = "good"
    HARD = "hard"
    AGAIN = "again"


class SessionTypeEnum(str, Enum):
    REVIEW = "review"
    NEW = "new"
    MIXED = "mixed"
    FOCUSED = "focused"


# User schemas
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8)
    daily_goal_minutes: Optional[int] = Field(15, ge=5, le=180)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    """User login schema"""
    email_or_username: str
    password: str


class UserResponse(UserBase, TimestampMixin):
    """User response schema"""
    id: str
    is_active: bool
    is_verified: bool
    learning_streak: int
    preferred_difficulty: DifficultyEnum
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = None
    daily_goal_minutes: Optional[int] = Field(None, ge=5, le=180)
    preferred_difficulty: Optional[DifficultyEnum] = None
    timezone: Optional[str] = None


# Authentication schemas
class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[UserResponse] = None


class TokenRefresh(BaseModel):
    """Token refresh schema"""
    refresh_token: str


# MicroCard schemas
class CardBase(BaseModel):
    """Base card schema"""
    title: str = Field(..., max_length=200)
    content: str
    explanation: Optional[str] = None
    card_type: CardTypeEnum = CardTypeEnum.CONCEPT
    difficulty: DifficultyEnum = DifficultyEnum.INTERMEDIATE
    estimated_time: Optional[int] = Field(3, ge=1, le=60)
    tags: Optional[List[str]] = []
    learning_objectives: Optional[List[str]] = []


class CardCreate(CardBase):
    """Card creation schema"""
    skill_id: Optional[str] = None
    examples: Optional[List[str]] = []
    quiz_data: Optional[Dict[str, Any]] = {}


class CardUpdate(BaseModel):
    """Card update schema"""
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: Optional[DifficultyEnum] = None
    estimated_time: Optional[int] = Field(None, ge=1, le=60)
    tags: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None


class CardResponse(CardBase, TimestampMixin):
    """Card response schema"""
    id: str
    creator_id: str
    skill_id: Optional[str] = None
    examples: List[str] = []
    quiz_data: Dict[str, Any] = {}
    ai_generated: bool = False
    
    class Config:
        from_attributes = True


# Review schemas
class ReviewBase(BaseModel):
    """Base review schema"""
    card_id: str
    result: ReviewResultEnum
    response_time: Optional[float] = None
    confidence: Optional[int] = Field(None, ge=1, le=5)


class ReviewCreate(ReviewBase):
    """Review creation schema"""
    study_session_id: Optional[str] = None
    notes: Optional[str] = None


class ReviewResponse(ReviewBase, TimestampMixin):
    """Review response schema"""
    id: str
    user_id: str
    interval: int
    easiness_factor: float
    next_review_date: datetime
    
    class Config:
        from_attributes = True


# Progress and Analytics schemas
class ProgressMetrics(BaseModel):
    """Progress metrics schema"""
    daily_goal: int
    daily_progress: int
    weekly_goal: int
    weekly_progress: int
    current_streak: int
    longest_streak: int
    total_xp: int
    level: int
    next_level_xp: int
    accuracy: float
    time_studied: int
    cards_completed: int
    paths_completed: int


class ProgressResponse(BaseModel):
    """User progress response"""
    user_id: str
    total_reviews: int
    weekly_reviews: int
    monthly_reviews: int
    current_streak: int
    longest_streak: int
    total_xp: int
    current_level: int
    next_level_xp: int
    performance: Dict[str, float]
    study_time: Dict[str, Any]
    mastered_cards: int
    daily_goal_minutes: int
    last_study_date: Optional[str] = None
    updated_at: str


class AnalyticsResponse(BaseModel):
    """Analytics response schema"""
    period_days: int
    start_date: str
    end_date: str
    daily_activity: List[Dict[str, Any]]
    performance_trends: Dict[str, Any]
    learning_patterns: Dict[str, Any]
    difficulty_analysis: Dict[str, Any]
    topic_performance: Dict[str, Any]
    recommendations: List[str]
    predictions: Dict[str, Any]
    insights: List[str]
    generated_at: str


# AI and Recommendation schemas
class ContentGenerationRequest(BaseModel):
    """Content generation request schema"""
    topic: str = Field(..., max_length=200)
    difficulty: DifficultyEnum = DifficultyEnum.INTERMEDIATE
    learning_style: str = Field("visual", regex="^(visual|auditory|kinesthetic|interactive)$")
    context: Optional[str] = Field(None, max_length=1000)
    card_type: Optional[CardTypeEnum] = CardTypeEnum.CONCEPT


class PersonalizedPathRequest(BaseModel):
    """Personalized learning path request"""
    topic: str = Field(..., max_length=200)
    skill_level: DifficultyEnum = DifficultyEnum.BEGINNER
    goals: List[str] = []
    time_commitment: int = Field(30, ge=5, le=180)  # minutes per day
    preferred_topics: Optional[List[str]] = []


class StudySessionRequest(BaseModel):
    """Study session request schema"""
    duration_minutes: int = Field(30, ge=5, le=180)
    focus_areas: Optional[List[str]] = []
    session_type: SessionTypeEnum = SessionTypeEnum.MIXED
    difficulty_preference: Optional[DifficultyEnum] = None


class RecommendationResponse(BaseModel):
    """Recommendation response schema"""
    card_id: str
    title: str
    difficulty: str
    estimated_time: int
    card_type: str
    tags: List[str]
    recommendation_score: float
    recommendation_type: str
    recommendation_reason: str
    optimal_for_user: bool
    predicted_success_rate: float


# Learning Path schemas
class LearningPathBase(BaseModel):
    """Base learning path schema"""
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    skill_level: DifficultyEnum = DifficultyEnum.BEGINNER
    estimated_duration_days: int = Field(..., ge=1)
    daily_time_minutes: int = Field(30, ge=5, le=180)


class LearningPathCreate(LearningPathBase):
    """Learning path creation schema"""
    subtopics: List[str] = []
    goals: List[str] = []


class LearningPathResponse(LearningPathBase, TimestampMixin):
    """Learning path response schema"""
    id: str
    creator_id: str
    subtopics: List[str]
    goals: List[str]
    completion_rate: float = 0.0
    ai_generated: bool = False
    
    class Config:
        from_attributes = True


# Gamification schemas
class XPTransaction(BaseModel):
    """XP transaction schema"""
    amount: int
    event_type: str
    description: str
    metadata: Optional[Dict[str, Any]] = {}


class Achievement(BaseModel):
    """Achievement schema"""
    id: str
    title: str
    description: str
    icon: str
    category: str
    threshold: int
    earned: bool = False
    progress: int = 0
    earned_at: Optional[datetime] = None


class Badge(BaseModel):
    """Badge schema"""
    id: str
    name: str
    description: str
    icon_url: str
    category: str
    rarity: str  # common, rare, epic, legendary
    earned_at: Optional[datetime] = None


# Study Group schemas
class StudyGroupBase(BaseModel):
    """Base study group schema"""
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    max_members: int = Field(10, ge=2, le=50)
    is_public: bool = True


class StudyGroupCreate(StudyGroupBase):
    """Study group creation schema"""
    tags: Optional[List[str]] = []


class StudyGroupResponse(StudyGroupBase, TimestampMixin):
    """Study group response schema"""
    id: str
    owner_id: str
    member_count: int
    is_active: bool
    tags: List[str] = []
    
    class Config:
        from_attributes = True


# Pagination schemas
class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool


# Error schemas
class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ValidationErrorResponse(BaseModel):
    """Validation error response schema"""
    error: str = "validation_error"
    message: str
    details: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Health check schema
class HealthCheckResponse(BaseModel):
    """Health check response schema"""
    status: str
    timestamp: str
    services: Dict[str, bool]
    version: str = "2.0.0"
