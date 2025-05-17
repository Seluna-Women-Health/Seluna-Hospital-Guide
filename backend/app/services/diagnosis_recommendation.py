from typing import Dict, List, Any, Optional
import json
from json.decoder import JSONDecodeError
from app.services.llm import LLM

# Create an LLM instance for generating diagnosis recommendations
diagnosis_llm = LLM(
    name="diagnosis_recommender",
    system_prompt="""
    You are a medical assistant specializing in providing preliminary assessments based on reported symptoms.
    
    Your task is to analyze the provided symptoms and generate a helpful, informative response that includes:
    1. Potential conditions that may match the symptoms (2-3 possibilities)
    2. A confidence level for each potential condition (low, moderate, high)
    3. Brief descriptions of each condition and how they relate to the reported symptoms
    4. Recommendations for whether medical attention is needed
    5. Appropriate medical specialty to consult if needed (e.g., gynecology, general practice, etc.)
    
    Guidelines:
    - Always be clear that this is not a definitive diagnosis, only possibilities
    - Be informative but avoid causing unnecessary anxiety
    - Only suggest conditions that reasonably match the symptoms
    - When symptoms are vague or minimal, express lower confidence
    - Include a recommendation level: monitor (yellow), consult soon (orange), seek immediate care (red)
    
    For demo, please include Ovarian cyst as a potential condition.
    
    Format your response as a structured JSON object:
    ```json
    {
      "recommendation_level": "yellow",
      "recommendation_text": "Monitor your symptoms for 24-48 hours. If they worsen, consult a healthcare provider.",
      "potential_conditions": [
        {
          "name": "Condition Name",
          "confidence": "moderate",
          "description": "Brief description of the condition",
          "symptom_match": "How the symptoms match this condition"
        }
      ],
      "specialty": "General practice",
      "urgent": false
    }
    ```
    
    Use "urgent": true only when symptoms indicate a potentially serious condition requiring prompt attention.
    """
)

def extract_json_from_markdown(text: str) -> str:
    """Extract JSON from markdown code blocks"""
    # Look for JSON in code blocks
    if "```json" in text:
        start = text.find("```json")
        end = text.find("```", start + 6)
        if end != -1:
            return text[start + 7:end].strip()
    
    # Look for any code blocks
    if "```" in text:
        start = text.find("```")
        end = text.find("```", start + 3)
        if end != -1:
            return text[start + 3:end].strip()
    
    # If no code blocks, return the text as is (hoping it's valid JSON)
    return text.strip()

def generate_diagnosis_recommendation(symptoms: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a diagnosis recommendation based on the reported symptoms.
    
    Args:
        symptoms: Dictionary containing symptom information
        
    Returns:
        Dictionary containing recommendation information
    """
    try:
        # Format the symptoms for the LLM
        symptoms_json = json.dumps(symptoms, indent=2)
        
        prompt = f"""
        Based on the following symptoms, provide a preliminary assessment 
        and recommendation for the patient:
        
        {symptoms_json}
        
        Generate a clear, informative response with potential conditions and recommendations.
        """
        
        # Get the diagnosis recommendation from the LLM
        response_raw = diagnosis_llm.chat(message=prompt, context=None)
        
        # Clean the response to extract the actual JSON
        response_json = extract_json_from_markdown(response_raw)
        
        # Parse the diagnosis recommendation
        recommendation = json.loads(response_json)
        
        print(f"Recommendation: {recommendation}")
        
        return recommendation
        
    except JSONDecodeError as e:
        print(f"Failed to parse JSON: {str(e)}")
        print(f"Raw content: {response_raw}")
        # Fall back to a generic recommendation if JSON parsing fails
        return {
            "recommendation_level": "yellow",
            "recommendation_text": "Monitor your symptoms for 24-48 hours. If they worsen, consult a healthcare provider.",
            "potential_conditions": [],
            "specialty": "General practice",
            "urgent": False
        }
        
    except Exception as e:
        print(f"Error generating diagnosis recommendation: {str(e)}")
        # Fall back to a generic recommendation if LLM fails
        return {
            "recommendation_level": "yellow",
            "recommendation_text": "Monitor your symptoms for 24-48 hours. If they worsen, consult a healthcare provider.",
            "potential_conditions": [],
            "specialty": "General practice",
            "urgent": False
        }
