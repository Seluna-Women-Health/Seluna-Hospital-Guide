from pydantic import BaseModel
from typing import List, Optional

class ResourceCard(BaseModel):
    """Model representing an educational resource"""
    id: str
    title: str
    description: str
    category: str
    tags: List[str]
    content_url: Optional[str] = None
    image_url: Optional[str] = None
    
class SimulationStep(BaseModel):
    """Model representing a step in the hospital visit simulation"""
    id: str
    title: str
    description: str
    tips: List[str]
    image_url: Optional[str] = None
    audio_url: Optional[str] = None 