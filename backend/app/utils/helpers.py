import json
import uuid
from datetime import datetime
from typing import Dict, Any

def generate_unique_id() -> str:
    """Generate a unique ID for reports or user sessions"""
    return str(uuid.uuid4())

def format_timestamp(dt: datetime = None) -> str:
    """Format a timestamp in ISO format"""
    if dt is None:
        dt = datetime.now()
    return dt.isoformat()

def sanitize_user_input(text: str) -> str:
    """
    Sanitize user input to prevent injection attacks
    Very basic implementation - would need more work in production
    """
    # Replace potentially dangerous characters
    return text.replace("<", "&lt;").replace(">", "&gt;")

def get_localized_message(message_key: str, language: str = "en") -> str:
    """
    Get a localized message based on the language
    
    In a real app, this would access a proper localization system
    """
    # Simple mock implementation with a few messages
    messages = {
        "welcome": {
            "en": "Welcome to the Women's Health Symptom Navigator",
            "es": "Bienvenida al Navegador de Síntomas de Salud Femenina",
            "zh": "欢迎使用女性健康症状导航"
        },
        "seek_help": {
            "en": "Please seek immediate medical attention",
            "es": "Por favor, busque atención médica inmediata",
            "zh": "请立即就医"
        }
    }
    
    if message_key not in messages:
        return f"[{message_key}]"
    
    if language not in messages[message_key]:
        language = "en"  # Default to English
    
    return messages[message_key][language] 