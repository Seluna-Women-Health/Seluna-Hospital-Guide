from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.routers import symptoms, speech, reports, resources, simulation

app = FastAPI(
    title="Women's Health Symptom Navigator API",
    description="Backend API for the Women's Health Symptom Navigator application",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Optional: React dev server
    "http://localhost:8080",  # Optional: Another common dev port
    # Add your production domains here when deploying
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with the /api prefix
app.include_router(symptoms.router, prefix="/api")
app.include_router(speech.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# After registering all routers:
for route in app.routes:
    logger.info(f"Route: {route.path}, methods: {route.methods}")

@app.get("/", tags=["health"])
async def health_check():
    return {"status": "healthy", "message": "Women's Health Symptom Navigator API is running"} 