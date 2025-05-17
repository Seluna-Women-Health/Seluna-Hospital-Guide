from typing import Dict, List, Any, Optional
import uuid

# In-memory storage for conversations (in production, use a database)
conversation_store = {}

def create_conversation() -> str:
    """Create a new conversation and return its ID"""
    conversation_id = str(uuid.uuid4())
    conversation_store[conversation_id] = {
        "messages": [
            {
                "role": "system", 
                "content": "Hello! Please describe your symptoms. Where are you experiencing pain or discomfort?"
            }
        ],
        "symptoms": {
            "pain_areas": [],
            "main_symptoms": [],
            "emotional_state": None,
            "emotional_scale": None
        }
    }
    return conversation_id

def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get a conversation by ID"""
    return conversation_store.get(conversation_id)

def add_message(conversation_id: str, role: str, content: str) -> bool:
    """Add a message to an existing conversation"""
    conversation = get_conversation(conversation_id)
    if not conversation:
        return False
    
    conversation["messages"].append({
        "role": role,
        "content": content
    })
    return True

def update_symptoms(conversation_id: str, symptoms: Dict[str, Any]) -> bool:
    """Update symptoms for a conversation"""
    conversation = get_conversation(conversation_id)
    if not conversation:
        return False
    
    conversation["symptoms"] = symptoms
    return True

def get_messages(conversation_id: str) -> Optional[List[Dict[str, str]]]:
    """Get all messages for a conversation"""
    conversation = get_conversation(conversation_id)
    if not conversation:
        return None
    
    return conversation["messages"]

def get_symptoms(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get symptoms for a conversation"""
    conversation = get_conversation(conversation_id)
    if not conversation:
        return None
    
    return conversation["symptoms"] 