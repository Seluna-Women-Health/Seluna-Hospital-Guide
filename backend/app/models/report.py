from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SymptomSummary(BaseModel):
    """Model for summarizing symptoms in a report"""
    pain_areas: List[Dict[str, Any]]
    pain_descriptions: List[str]
    additional_symptoms: List[str]
    triage_result: str
    
class Report(BaseModel):
    """Model representing a user's symptom report"""
    id: str
    user_name: Optional[str] = None
    symptom_summary: SymptomSummary
    notes: Optional[str] = None
    timestamp: datetime
    language: str = "en" 