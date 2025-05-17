from typing import List, Dict, Any
from pydantic import BaseModel, validator

class InputValidator(BaseModel):
    """Base validator with common validation methods"""
    
    @validator("*", pre=True)
    def strip_strings(cls, v):
        """Strip whitespace from strings"""
        if isinstance(v, str):
            return v.strip()
        return v

def validate_pain_intensity(intensity: int) -> int:
    """Validate that pain intensity is within valid range (0-10)"""
    if intensity < 0:
        return 0
    if intensity > 10:
        return 10
    return intensity

def validate_language_code(language: str) -> str:
    """Validate that the language code is supported"""
    supported_languages = ["en", "es", "zh"]
    if language not in supported_languages:
        return "en"  # Default to English
    return language 