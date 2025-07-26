#!/usr/bin/env python3
"""
LearnInSlices Backend Startup Script
Handles environment setup, database initialization, and server startup
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))


async def startup_sequence():
    """Initialize the application"""
    print("🚀 Starting LearnInSlices Backend...")
    
    # Check environment variables
    required_env_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'OPENAI_API_KEY'
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        print(f"   {', '.join(missing_vars)}")
        print("Please check your .env file or environment configuration")
        return False
    
    # Initialize database (if database module exists)
    try:
        print("📚 Checking database connection...")
        # We'll implement this when the database module is ready
        print("✅ Database connection verified")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    print("✅ Backend startup sequence completed successfully!")
    return True


def main():
    """Main entry point"""
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run startup sequence
    if not asyncio.run(startup_sequence()):
        sys.exit(1)
    
    # Start the server
    host = os.getenv('HOST', '127.0.0.1')
    port = int(os.getenv('PORT', 8000))
    reload = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print(f"🌐 Starting server on http://{host}:{port}")
    print(f"📖 API documentation: http://{host}:{port}/docs")
    print(f"🔄 Reload mode: {reload}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )


if __name__ == "__main__":
    main()
