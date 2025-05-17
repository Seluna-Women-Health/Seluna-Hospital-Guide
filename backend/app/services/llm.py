from openai import OpenAI
from app.config import settings


class LLM:
    def __init__(self, name: str, system_prompt=None):
        # Use settings from centralized config
        self.model_name = settings.LLM.MODEL_NAME
        api_key = settings.LLM.API_KEY
        base_url = settings.LLM.BASE_URL
        
        # Initialize OpenAI client with appropriate settings
        client_kwargs = {"api_key": api_key}
        if base_url:
            client_kwargs["base_url"] = base_url
            
        self.client = OpenAI(**client_kwargs)
        self.system_prompt = system_prompt
        self.name = name
        
        self.max_tokens = None
        self.temperature = None
        self.top_p = None
        self.frequency_penalty = None
        self.presence_penalty = None
    
    def chat(self, message, context: list[dict] = None):
        if context:
            messages = [{
                "role": "system",
                "content": self.system_prompt
            }]
            messages.extend(context)
            messages.append({"role": "user", "content": message})
        else:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": message}
            ]
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            top_p=self.top_p,
            frequency_penalty=self.frequency_penalty,
            presence_penalty=self.presence_penalty
        )
        response_content = response.choices[0].message.content
        return response_content