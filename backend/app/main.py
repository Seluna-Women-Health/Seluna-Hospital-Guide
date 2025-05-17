from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import symptoms, speech, reports, resources, simulation

app = FastAPI(
    title="Women's Health Symptom Navigator API",
    description="Backend API for the Women's Health Symptom Navigator application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with the /api prefix
app.include_router(symptoms.router, prefix="/api", tags=["symptoms"])
app.include_router(speech.router, prefix="/api", tags=["speech"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(resources.router, prefix="/api", tags=["resources"])
app.include_router(simulation.router, prefix="/api", tags=["simulation"])

@app.get("/", tags=["health"])
async def health_check():
    return {"status": "healthy", "message": "Women's Health Symptom Navigator API is running"} 