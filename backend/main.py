"""
LearnInSlices Backend API Server
FastAPI application with AI-powered learning features

Key Features:
- RESTful API for frontend integration
- AI-powered content recommendations
- Advanced analytics and progress tracking
- Real-time collaboration features
- Spaced repetition optimization
- Gamification system
"""

from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import logging
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import asyncio

# Local imports
from app.database import get_db, init_db
from app.models import User, MicroCard, Review, Skill
from app.ai_service import AILearningService
from app.analytics_service import AnalyticsService
from app.recommendation_engine import RecommendationEngine
from app.auth import AuthService, get_current_user
from app.schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    CardCreate, CardResponse, CardUpdate,
    ReviewCreate, ReviewResponse,
    ProgressResponse, AnalyticsResponse,
    RecommendationResponse, StudySessionRequest,
    PersonalizedPathRequest, ContentGenerationRequest
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
ai_service = None
analytics_service = None
recommendation_engine = None
auth_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    global ai_service, analytics_service, recommendation_engine, auth_service
    
    # Startup
    logger.info("Starting LearnInSlices Backend API...")
    
    # Initialize database
    await init_db()
    
    # Initialize AI services
    ai_service = AILearningService()
    await ai_service.initialize()
    
    # Initialize analytics service
    analytics_service = AnalyticsService()
    
    # Initialize recommendation engine
    recommendation_engine = RecommendationEngine(ai_service)
    await recommendation_engine.initialize()
    
    # Initialize auth service
    auth_service = AuthService()
    
    logger.info("All services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down services...")
    if ai_service:
        await ai_service.cleanup()

# Create FastAPI app
app = FastAPI(
    title="LearnInSlices API",
    description="AI-Powered Microlearning Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "ai_service": ai_service.is_ready() if ai_service else False,
            "analytics": analytics_service.is_ready() if analytics_service else False,
            "recommendations": recommendation_engine.is_ready() if recommendation_engine else False
        }
    }

# Authentication endpoints
@app.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db=Depends(get_db)):
    """Register a new user"""
    try:
        user = await auth_service.create_user(db, user_data)
        tokens = await auth_service.create_tokens(user.id)
        return TokenResponse(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
            user=UserResponse.from_orm(user)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db=Depends(get_db)):
    """Authenticate user and return tokens"""
    try:
        user = await auth_service.authenticate_user(db, credentials)
        tokens = await auth_service.create_tokens(user.id)
        return TokenResponse(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
            user=UserResponse.from_orm(user)
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db=Depends(get_db)):
    """Refresh access token"""
    try:
        tokens = await auth_service.refresh_tokens(db, refresh_token)
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# User endpoints
@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse.from_orm(current_user)

@app.get("/users/me/progress", response_model=ProgressResponse)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get comprehensive user progress data"""
    progress_data = await analytics_service.get_user_progress(db, current_user.id)
    return ProgressResponse(**progress_data)

@app.get("/users/me/analytics", response_model=AnalyticsResponse)
async def get_user_analytics(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
    days: int = 30
):
    """Get detailed learning analytics"""
    analytics_data = await analytics_service.get_learning_analytics(
        db, current_user.id, days
    )
    return AnalyticsResponse(**analytics_data)

# AI-Powered Content Endpoints
@app.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
    limit: int = 10
):
    """Get AI-powered content recommendations"""
    recommendations = await recommendation_engine.get_personalized_recommendations(
        db, current_user.id, limit
    )
    return [RecommendationResponse(**rec) for rec in recommendations]

@app.post("/ai/generate-content", response_model=CardResponse)
async def generate_content(
    request: ContentGenerationRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Generate AI-powered learning content"""
    try:
        card_data = await ai_service.generate_microcard(
            topic=request.topic,
            difficulty=request.difficulty,
            learning_style=request.learning_style,
            context=request.context
        )
        
        # Save to database
        card = MicroCard(**card_data, creator_id=current_user.id)
        db.add(card)
        await db.commit()
        await db.refresh(card)
        
        return CardResponse.from_orm(card)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

@app.post("/ai/create-path", response_model=Dict[str, Any])
async def create_personalized_path(
    request: PersonalizedPathRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Create AI-generated personalized learning path"""
    try:
        learning_path = await ai_service.create_personalized_path(
            user_id=current_user.id,
            topic=request.topic,
            skill_level=request.skill_level,
            goals=request.goals,
            time_commitment=request.time_commitment
        )
        return learning_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Path creation failed: {str(e)}")

@app.post("/ai/optimize-review", response_model=Dict[str, Any])
async def optimize_review_schedule(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """AI-optimized spaced repetition scheduling"""
    try:
        optimized_schedule = await ai_service.optimize_spaced_repetition(
            db, current_user.id
        )
        return optimized_schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schedule optimization failed: {str(e)}")

# MicroCard endpoints
@app.get("/cards", response_model=List[CardResponse])
async def get_cards(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
    skill_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 50
):
    """Get micro-cards with optional filtering"""
    query = db.query(MicroCard)
    
    if skill_id:
        query = query.filter(MicroCard.skill_id == skill_id)
    if difficulty:
        query = query.filter(MicroCard.difficulty == difficulty)
    
    cards = query.limit(limit).all()
    return [CardResponse.from_orm(card) for card in cards]

@app.post("/cards", response_model=CardResponse)
async def create_card(
    card_data: CardCreate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Create a new micro-card"""
    card = MicroCard(**card_data.dict(), creator_id=current_user.id)
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return CardResponse.from_orm(card)

@app.put("/cards/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: str,
    card_data: CardUpdate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Update an existing micro-card"""
    card = db.query(MicroCard).filter(
        MicroCard.id == card_id,
        MicroCard.creator_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    for field, value in card_data.dict(exclude_unset=True).items():
        setattr(card, field, value)
    
    await db.commit()
    await db.refresh(card)
    return CardResponse.from_orm(card)

# Review endpoints
@app.post("/reviews", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Record a card review and update spaced repetition"""
    review = Review(**review_data.dict(), user_id=current_user.id)
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    # Background task to update AI models with new data
    background_tasks.add_task(
        ai_service.update_user_model,
        current_user.id,
        review_data.dict()
    )
    
    return ReviewResponse.from_orm(review)

@app.get("/reviews/due", response_model=List[CardResponse])
async def get_due_reviews(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get cards due for review"""
    due_cards = await analytics_service.get_due_cards(db, current_user.id)
    return [CardResponse.from_orm(card) for card in due_cards]

# Study session endpoints
@app.post("/study/session", response_model=Dict[str, Any])
async def start_study_session(
    request: StudySessionRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Start an AI-optimized study session"""
    try:
        session_plan = await ai_service.create_study_session(
            db=db,
            user_id=current_user.id,
            duration_minutes=request.duration_minutes,
            focus_areas=request.focus_areas,
            session_type=request.session_type
        )
        return session_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session creation failed: {str(e)}")

# Real-time collaboration endpoints (WebSocket would be added for real-time features)
@app.get("/collaboration/groups", response_model=List[Dict[str, Any]])
async def get_study_groups(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get user's study groups"""
    # Implementation for study groups
    return []

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
