"""
AI Configuration Manager for LearnInSlices
Centralized configuration management for AI services
"""

import os
from typing import List, Dict, Any
from pydantic import BaseSettings, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv('.env.ai')  # Load AI-specific configuration


class AIConfig(BaseSettings):
    """AI Configuration Settings"""
    
    # OpenAI Configuration
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-3.5-turbo", env="OPENAI_MODEL")
    openai_embedding_model: str = Field(
        default="text-embedding-ada-002", 
        env="OPENAI_EMBEDDING_MODEL"
    )
    openai_max_tokens: int = Field(default=2048, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    
    # Hugging Face Configuration
    hf_model_name: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2", 
        env="HF_MODEL_NAME"
    )
    hf_embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        env="HF_EMBEDDING_MODEL"
    )
    hf_cache_dir: str = Field(default="./models/cache", env="HF_CACHE_DIR")
    max_sequence_length: int = Field(default=512, env="MAX_SEQUENCE_LENGTH")
    
    # AI Service Toggles
    ai_content_generation_enabled: bool = Field(
        default=True, 
        env="AI_CONTENT_GENERATION_ENABLED"
    )
    ai_recommendations_enabled: bool = Field(
        default=True, 
        env="AI_RECOMMENDATIONS_ENABLED"
    )
    ai_analytics_enabled: bool = Field(
        default=True, 
        env="AI_ANALYTICS_ENABLED"
    )
    ai_difficulty_assessment_enabled: bool = Field(
        default=True, 
        env="AI_DIFFICULTY_ASSESSMENT_ENABLED"
    )
    
    # Performance Settings
    embedding_batch_size: int = Field(default=32, env="EMBEDDING_BATCH_SIZE")
    generation_timeout_seconds: int = Field(
        default=30, 
        env="GENERATION_TIMEOUT_SECONDS"
    )
    recommendation_cache_ttl: int = Field(
        default=3600, 
        env="RECOMMENDATION_CACHE_TTL"
    )
    analytics_batch_size: int = Field(
        default=100, 
        env="ANALYTICS_BATCH_SIZE"
    )
    
    # Content Generation Settings
    default_content_length: int = Field(
        default=200, 
        env="DEFAULT_CONTENT_LENGTH"
    )
    max_content_length: int = Field(
        default=1000, 
        env="MAX_CONTENT_LENGTH"
    )
    supported_languages: List[str] = Field(
        default=["en", "es", "fr", "de"], 
        env="SUPPORTED_LANGUAGES"
    )
    difficulty_levels: List[str] = Field(
        default=["beginner", "intermediate", "advanced", "expert"],
        env="DIFFICULTY_LEVELS"
    )
    
    # Recommendation Settings
    recommendation_count: int = Field(
        default=10, 
        env="RECOMMENDATION_COUNT"
    )
    similarity_threshold: float = Field(
        default=0.7, 
        env="SIMILARITY_THRESHOLD"
    )
    collaborative_weight: float = Field(
        default=0.6, 
        env="COLLABORATIVE_WEIGHT"
    )
    content_based_weight: float = Field(
        default=0.4, 
        env="CONTENT_BASED_WEIGHT"
    )
    user_behavior_weight: float = Field(
        default=0.3, 
        env="USER_BEHAVIOR_WEIGHT"
    )
    
    # Analytics Settings
    analytics_update_interval: int = Field(
        default=300, 
        env="ANALYTICS_UPDATE_INTERVAL"
    )
    performance_metrics_retention_days: int = Field(
        default=90, 
        env="PERFORMANCE_METRICS_RETENTION_DAYS"
    )
    learning_pattern_analysis_enabled: bool = Field(
        default=True, 
        env="LEARNING_PATTERN_ANALYSIS_ENABLED"
    )
    predictive_analytics_enabled: bool = Field(
        default=True, 
        env="PREDICTIVE_ANALYTICS_ENABLED"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def is_openai_configured(self) -> bool:
        """Check if OpenAI is properly configured"""
        return bool(self.openai_api_key and self.openai_api_key != "")
    
    def get_model_config(self) -> Dict[str, Any]:
        """Get model configuration for AI services"""
        return {
            "openai": {
                "api_key": self.openai_api_key,
                "model": self.openai_model,
                "embedding_model": self.openai_embedding_model,
                "max_tokens": self.openai_max_tokens,
                "temperature": self.openai_temperature,
                "enabled": self.is_openai_configured()
            },
            "huggingface": {
                "model_name": self.hf_model_name,
                "embedding_model": self.hf_embedding_model,
                "cache_dir": self.hf_cache_dir,
                "max_sequence_length": self.max_sequence_length,
                "enabled": True
            }
        }
    
    def get_performance_config(self) -> Dict[str, Any]:
        """Get performance configuration"""
        return {
            "embedding_batch_size": self.embedding_batch_size,
            "generation_timeout": self.generation_timeout_seconds,
            "recommendation_cache_ttl": self.recommendation_cache_ttl,
            "analytics_batch_size": self.analytics_batch_size
        }
    
    def validate_configuration(self) -> Dict[str, Any]:
        """Validate AI configuration and return status"""
        issues = []
        warnings = []
        
        # Check OpenAI configuration
        if not self.is_openai_configured():
            warnings.append("OpenAI API key not configured - using fallback models")
        
        # Check cache directory
        if not os.path.exists(self.hf_cache_dir):
            try:
                os.makedirs(self.hf_cache_dir, exist_ok=True)
            except Exception as e:
                issues.append(f"Cannot create cache directory: {e}")
        
        # Validate weights sum to reasonable values
        total_weight = (self.collaborative_weight + 
                       self.content_based_weight + 
                       self.user_behavior_weight)
        if total_weight > 2.0:
            warnings.append("Recommendation weights sum is high - may cause bias")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "openai_configured": self.is_openai_configured(),
            "services_enabled": {
                "content_generation": self.ai_content_generation_enabled,
                "recommendations": self.ai_recommendations_enabled,
                "analytics": self.ai_analytics_enabled,
                "difficulty_assessment": self.ai_difficulty_assessment_enabled
            }
        }


# Global configuration instance
ai_config = AIConfig()


def get_ai_config() -> AIConfig:
    """Get the global AI configuration instance"""
    return ai_config


def reload_ai_config():
    """Reload AI configuration from environment"""
    global ai_config
    ai_config = AIConfig()
    return ai_config
