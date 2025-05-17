from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class SimulationStep(BaseModel):
    id: str
    title: str
    description: str
    tips: List[str]
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    
@router.get("/simulation/steps", response_model=List[SimulationStep])
async def get_simulation_steps(language: str = "en"):
    """
    Get the hospital visit simulation steps
    """
    try:
        # In a real implementation, this would come from a database or CMS
        steps = [
            SimulationStep(
                id="arrival",
                title="Arriving at the Clinic",
                description="What to expect when you arrive at the gynecological clinic",
                tips=["Arrive 15 minutes early to complete paperwork", 
                      "Bring your ID and insurance card"],
                image_url="/images/simulation/arrival.jpg"
            ),
            # Add more steps based on the README
        ]
        return steps
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch simulation steps: {str(e)}")

@router.get("/simulation/steps/{step_id}", response_model=SimulationStep)
async def get_simulation_step(step_id: str, language: str = "en"):
    """
    Get a specific step in the hospital visit simulation
    """
    # Implementation details here
    pass 