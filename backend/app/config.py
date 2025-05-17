import os
import yaml
from typing import Optional
from pydantic_settings import BaseSettings

class LLMSettings(BaseSettings):
    MODEL_NAME: str = "gpt-4o-mini-2024-07-18"
    API_KEY: str = ""
    BASE_URL: Optional[str] = None

class SpeechSettings(BaseSettings):
    ELEVENLABS_KEY: Optional[str] = None

class Settings(BaseSettings):
    APP_NAME: str = "Women's Health Symptom Navigator"
    DEBUG: bool = os.getenv("DEBUG", False)
    
    # Database settings (if needed)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # LLM Settings
    LLM: LLMSettings = LLMSettings()
    
    # Speech Settings
    SPEECH: SpeechSettings = SpeechSettings()
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:3000"]
    
    # Yaml config path (optional override)
    CONFIG_YAML_PATH: str = os.path.join(os.path.dirname(__file__), "config.yaml")
    
    class Config:
        env_file = ".env"
        env_nested_delimiter = "__"

    def load_yaml_config(self):
        """Load configuration from YAML file if it exists, overriding environment variables"""
        if not os.path.exists(self.CONFIG_YAML_PATH):
            return
            
        with open(self.CONFIG_YAML_PATH, "r") as file:
            yaml_config = yaml.safe_load(file)
            
        # Update LLM settings
        if yaml_config.get("model_name"):
            self.LLM.MODEL_NAME = yaml_config["model_name"]
        if yaml_config.get("api_key"):
            self.LLM.API_KEY = yaml_config["api_key"]
        if yaml_config.get("base_url"):
            self.LLM.BASE_URL = yaml_config["base_url"]
            
        # Update Speech settings
        if yaml_config.get("elevenlabs_key"):
            self.SPEECH.ELEVENLABS_KEY = yaml_config["elevenlabs_key"]

# Create the settings instance
settings = Settings()
# Load YAML config (if available)
settings.load_yaml_config() 