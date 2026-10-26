import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from .config import FRONTEND_URLS, UPLOAD_DIR
from .database import engine, Base
from .seed import seed_database
from .routers import sanctum, auth, queue, jobs, forms, desk, support, operator, ai

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Print-Fy API Engine",
    description="Campus print-queue management system backend for Print-Fy",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Seed initial test users and data
    seed_database()

# Static uploads mount
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(sanctum.router)
app.include_router(auth.router)
app.include_router(queue.router)
app.include_router(jobs.router)
app.include_router(forms.router)
app.include_router(desk.router)
app.include_router(support.router)
app.include_router(operator.router)
app.include_router(ai.router)

@app.get("/")
def health_check():
    return {
        "service": "Print-Fy API Engine",
        "status": "healthy",
        "documentation": "/docs",
        "author": "Faiqa Arooj"
    }

@app.get("/api/health")
def api_health():
    return {"status": "ok", "timestamp": "live"}
