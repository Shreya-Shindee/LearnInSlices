"""
LearnInSlices Backend - Main FastAPI Application
AI-powered microlearning platform with comprehensive analytics and recommendations
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global service instances
ai_service = None
analytics_service = None  
recommendation_engine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    global ai_service, analytics_service, recommendation_engine
    
    # Startup
    logger.info("🚀 Starting LearnInSlices Backend...")
    
    try:
        # Initialize AI service
        from app.ai_service import AILearningService
        ai_service = AILearningService()
        logger.info("✅ AI Service initialized")
    except Exception as e:
        logger.warning(f"⚠️ AI Service initialization failed: {e}")
    
    try:
        # Initialize analytics service
        from app.analytics_service import AnalyticsService
        analytics_service = AnalyticsService()
        logger.info("✅ Analytics Service initialized")
    except Exception as e:
        logger.warning(f"⚠️ Analytics Service initialization failed: {e}")
    
    try:
        # Initialize recommendation engine
        from app.recommendation_engine import RecommendationEngine
        recommendation_engine = RecommendationEngine()
        logger.info("✅ Recommendation Engine initialized")
    except Exception as e:
        logger.warning(f"⚠️ Recommendation Engine initialization failed: {e}")
    
    logger.info("✅ Backend services ready!")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down LearnInSlices Backend...")


# Create FastAPI application
app = FastAPI(
    title="LearnInSlices API",
    description="AI-powered microlearning platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "LearnInSlices API v1.0.0",
        "status": "active",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "ai": ai_service is not None,
            "analytics": analytics_service is not None,
            "recommendations": recommendation_engine is not None
        }
    }


# API Routes will be added as we build them
# For now, we have a basic working server


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
