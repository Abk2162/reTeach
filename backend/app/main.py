"""
FastAPI Application Entry Point
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables FIRST (before any imports that use them)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)
print(f"[STARTUP] Loading .env from: {env_path}")
print(f"[STARTUP] GOOGLE_API_KEY found: {bool(os.getenv('GOOGLE_API_KEY'))}")

from app.config import settings
from app.database import db

# Import routers
from app.routers import topics, questions, surveys, forms, textbooks, teachers

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI-powered diagnostic assessment generation for education",
    debug=settings.debug,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,  # Not needed - auth handled by NextAuth on same domain
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],  # Restrict headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(topics.router)
app.include_router(questions.router)
app.include_router(surveys.router)
app.include_router(forms.router)
app.include_router(textbooks.router)
app.include_router(teachers.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_healthy = await db.health_check()
    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "environment": settings.environment,
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "EdTech Diagnostic API",
        "version": "0.1.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
