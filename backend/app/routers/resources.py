from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class ResourceCard(BaseModel):
    id: str
    title: str
    description: str
    category: str
    tags: List[str]
    content_url: Optional[str] = None
    image_url: Optional[str] = None
    
@router.get("/resources", response_model=List[ResourceCard])
async def get_resources(
    category: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    language: str = "en"
):
    """
    Get educational resources filtered by category, tags, and language
    """
    try:
        # In a real implementation, this would query a database
        # For now, return mock data
        resources = [
            ResourceCard(
                id="1",
                title="Understanding Menstrual Pain",
                description="Learn about the causes of menstrual pain and when to seek help",
                category="pain",
                tags=["menstruation", "cramps", "educational"],
                content_url="/content/menstrual-pain",
                image_url="/images/menstrual-pain.jpg"
            ),
            # Add more sample resources
        ]
        
        # Filter by category if provided
        if category:
            resources = [r for r in resources if r.category == category]
            
        # Filter by tags if provided
        if tags:
            resources = [r for r in resources if any(tag in r.tags for tag in tags)]
            
        return resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch resources: {str(e)}") 