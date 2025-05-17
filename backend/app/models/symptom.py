from pydantic import BaseModel
from typing import List, Optional

class PainArea(BaseModel):
    """Model representing a pain area on the body"""
    area: str
    intensity: int  # 0-10 scale
    description: str
    
class Symptom(BaseModel):
    """Model representing a user's symptoms"""
    pain_areas: List[PainArea]
    additional_symptoms: List[str] = []
    emotional_state: Optional[str] = None
    
class TriageResult(BaseModel):
    """Model representing the result of symptom analysis"""
    severity: str  # "green", "yellow", or "red"
    recommendation: str
    summary: str 