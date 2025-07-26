"""
LearnInSlices Backend - Demo Server
Basic FastAPI application for demonstrating AI features without database dependencies
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="LearnInSlices Demo API",
    description="AI-powered microlearning platform demo",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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
        "message": "LearnInSlices Demo API v1.0.0",
        "status": "active",
        "docs": "/docs",
        "features": [
            "AI Content Generation",
            "Learning Analytics", 
            "Recommendation Engine",
            "User Authentication"
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "api": True,
            "ai": "demo_mode",
            "analytics": "demo_mode",
            "recommendations": "demo_mode"
        },
        "timestamp": "2024-01-01T00:00:00Z"
    }


# Demo AI endpoints
@app.post("/api/v1/ai/generate-content")
async def generate_content(request: dict):
    """Demo AI content generation"""
    return {
        "id": "demo-card-123",
        "title": f"Generated: {request.get('topic', 'Sample Topic')}",
        "content": f"This is AI-generated content about {request.get('topic', 'the topic')}. "
                  "In a real implementation, this would use advanced language models "
                  "to create personalized learning content.",
        "difficulty": request.get('difficulty', 'intermediate'),
        "estimated_time": 5,
        "tags": ["ai-generated", request.get('topic', 'sample').lower()],
        "created_at": "2024-01-01T00:00:00Z"
    }


@app.get("/api/v1/analytics/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Demo analytics endpoint"""
    return {
        "user_id": user_id,
        "total_cards": 150,
        "completed_cards": 75,
        "progress_percentage": 50.0,
        "study_streak": 7,
        "average_difficulty": 3.2,
        "time_spent_minutes": 1200,
        "performance_trend": "improving",
        "last_study_date": "2024-01-01T00:00:00Z"
    }


@app.get("/api/v1/recommendations/content/{user_id}")
async def get_recommendations(user_id: str, count: int = 10, rec_type: str = "hybrid"):
    """Enhanced recommendations endpoint with multiple algorithms"""
    
    # Import the enhanced recommendation engine
    try:
        from app.recommendation_engine import AdvancedRecommendationEngine
        engine = AdvancedRecommendationEngine()
        
        # Get enhanced recommendations
        recommendations = await engine.get_enhanced_recommendations(
            user_id=user_id,
            count=count,
            recommendation_type=rec_type,
            include_diversity=True,
            include_novelty=True
        )
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "total_count": len(recommendations),
            "algorithm_info": {
                "type": rec_type,
                "features": ["collaborative_filtering", "content_based", "knowledge_based"],
                "diversity_enabled": True,
                "novelty_enabled": True
            },
            "generated_at": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        # Fallback to basic recommendations
        basic_recommendations = [
            {
                "id": f"rec-{i}",
                "title": f"Recommended Topic {i+1}",
                "type": "microcard" if i % 2 == 0 else "learning_path",
                "confidence": 0.9 - (i * 0.05),
                "reason": "Recommended based on your learning history",
                "algorithm": "fallback",
                "difficulty": ["beginner", "intermediate", "advanced"][i % 3],
                "estimated_time": 15 + (i * 5),
                "tags": ["general", "recommended"],
                "generated_at": "2024-01-01T00:00:00Z"
            }
            for i in range(count)
        ]
        
        return {
            "user_id": user_id,
            "recommendations": basic_recommendations,
            "total_count": len(basic_recommendations),
            "algorithm_info": {
                "type": "fallback",
                "note": "Using basic recommendations due to service initialization"
            },
            "generated_at": "2024-01-01T00:00:00Z"
        }


@app.post("/api/v1/auth/register")
async def register_demo():
    """Demo registration endpoint"""
    return {
        "message": "Demo registration successful",
        "user_id": "demo-user-123",
        "access_token": "demo-token-abc123",
        "token_type": "bearer"
    }


@app.post("/api/v1/auth/login")
async def login_demo():
    """Demo login endpoint"""
    return {
        "message": "Demo login successful",
        "user_id": "demo-user-123", 
        "access_token": "demo-token-abc123",
        "token_type": "bearer"
    }


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting LearnInSlices Demo Backend...")
    print("📖 API Documentation: http://127.0.0.1:8000/docs")
    print("🔍 API Explorer: http://127.0.0.1:8000/redoc")
    
    uvicorn.run(
        "demo_server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
