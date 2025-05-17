from fastapi import Header, HTTPException
from typing import Optional

async def get_language(accept_language: Optional[str] = Header(None)) -> str:
    """
    Extract the preferred language from the Accept-Language header
    or default to English if not specified
    """
    if not accept_language:
        return "en"
    
    # Very simple language extraction
    # In a real app, you'd use more sophisticated parsing
    if accept_language.startswith("zh"):
        return "zh"
    elif accept_language.startswith("es"):
        return "es"
    else:
        return "en"

async def get_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract the token from the Authorization header
    This would be used if you implement authentication later
    """
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "")
    return None 