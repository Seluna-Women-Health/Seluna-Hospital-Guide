from app.services.llm import LLM
from typing import Dict, Any

# Initialize the analysis LLM
analysis_llm = LLM(
    name="symptom_analyzer",
    system_prompt="""
    You are a medical triage assistant specializing in women's health.
    
    Analyze the patient's symptoms and categorize the severity as:
    - green: non-urgent, can be managed at home
    - yellow: needs medical attention soon but not an emergency
    - red: requires immediate medical attention
    
    Provide a concise recommendation and summary based on the symptoms.
    
    Format your response as a JSON object:
    {
        "severity": "green|yellow|red",
        "recommendation": "brief recommendation",
        "summary": "summary of analysis"
    }
    """
)

def analyze_symptoms(symptom_data):
    """
    Analyze symptoms and provide a triage result
    """
    try:
        # Format the symptom data for the LLM
        symptom_text = format_symptoms_for_llm(symptom_data)
        
        # Use LLM to analyze symptoms
        result_json = analysis_llm.chat(
            message=f"Analyze these symptoms: {symptom_text}"
        )
        
        # Parse the result
        import json
        result = json.loads(result_json)
        
        return result
    except Exception as e:
        print(f"Error analyzing symptoms with LLM: {str(e)}")
        # Return a fallback result
        return {
            "severity": "yellow",
            "recommendation": "We couldn't fully analyze your symptoms. Please consult with a healthcare provider to be safe.",
            "summary": "Analysis error occurred. Your symptoms require professional evaluation."
        }

def format_symptoms_for_llm(symptom_data):
    """
    Format symptoms data as text for the LLM
    """
    parts = []
    
    # Format pain areas
    if symptom_data.pain_areas:
        pain_parts = []
        for area in symptom_data.pain_areas:
            pain_parts.append(f"{area.description} in {area.area} (intensity: {area.intensity}/10)")
        parts.append("Pain: " + ", ".join(pain_parts))
    
    # Format additional symptoms
    if symptom_data.additional_symptoms:
        parts.append("Additional symptoms: " + ", ".join(symptom_data.additional_symptoms))
    
    # Format emotional state
    if symptom_data.emotional_state:
        parts.append(f"Emotional state: {symptom_data.emotional_state}")
    
    return "; ".join(parts) 