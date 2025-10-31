"""
LLM Service
Google Gemini API client with retry logic and caching
"""

import json
import hashlib
import os
from pathlib import Path
from typing import Optional, Any, Dict

import google.generativeai as genai
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
)

from app.config import settings


class LLMService:
    """Service for interacting with Google Gemini API"""

    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        self.cache_dir = settings.cache_dir / "llm_responses"

        if settings.cache_enabled:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        print("[LLM] Initialized Google Gemini 2.0 Flash")

    def _get_cache_key(self, prompt: str, **kwargs) -> str:
        """Generate cache key from prompt and parameters"""
        cache_input = f"{prompt}:{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.sha256(cache_input.encode()).hexdigest()

    def _read_cache(self, cache_key: str) -> Optional[str]:
        """Read response from cache"""
        if not settings.cache_enabled:
            return None

        cache_file = self.cache_dir / f"{cache_key}.json"
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    cached = json.load(f)
                print(f"[CACHE HIT] Using cached response for {cache_key[:8]}...")
                return cached.get("response")
            except Exception as e:
                print(f"[CACHE ERROR] Failed to read cache: {e}")
                return None
        return None

    def _write_cache(self, cache_key: str, response: str, metadata: Dict = None) -> None:
        """Write response to cache"""
        if not settings.cache_enabled:
            return

        cache_file = self.cache_dir / f"{cache_key}.json"
        try:
            with open(cache_file, 'w') as f:
                json.dump({
                    "response": response,
                    "metadata": metadata or {},
                    "model": self.model,
                }, f, indent=2)
            print(f"[CACHE WRITE] Cached response to {cache_key[:8]}...")
        except Exception as e:
            print(f"[CACHE ERROR] Failed to write cache: {e}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 4096,
        temperature: float = 1.0,
        system: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate text using Gemini API with retry logic

        Args:
            prompt: User prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-1)
            system: Optional system prompt
            **kwargs: Additional parameters

        Returns:
            Generated text response

        Raises:
            Exception: If API call fails after retries
        """
        # Check cache first
        cache_key = self._get_cache_key(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            **kwargs
        )

        cached_response = self._read_cache(cache_key)
        if cached_response:
            return cached_response

        # Make API call
        print(f"[LLM] Calling Gemini API...")
        print(f"[LLM] Prompt length: {len(prompt)} chars")

        # Combine system prompt and user prompt
        full_prompt = prompt
        if system:
            full_prompt = f"{system}\n\n{prompt}"

        try:
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )

            text_content = response.text

            # Cache the response
            metadata = {
                "usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": len(text_content.split()),
                },
                "model": "gemini-2.0-flash-exp",
            }
            self._write_cache(cache_key, text_content, metadata)

            print(f"[LLM] ✓ Success - Response: {len(text_content)} chars")
            return text_content

        except Exception as e:
            print(f"[LLM ERROR] {type(e).__name__}: {str(e)}")
            raise Exception(f"LLM API call failed: {str(e)}")

    async def generate_json(
        self,
        prompt: str,
        max_tokens: int = 4096,
        **kwargs
    ) -> Any:
        """
        Generate JSON response from Claude

        Args:
            prompt: User prompt (should request JSON output)
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters

        Returns:
            Parsed JSON object

        Raises:
            ValueError: If response is not valid JSON
        """
        response_text = await self.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=0.5,  # Lower temperature for structured output
            **kwargs
        )

        # Try to extract JSON from response
        # Sometimes Claude wraps JSON in markdown code blocks or adds explanatory text
        response_text = response_text.strip()

        # Remove markdown code block if present
        if response_text.startswith("```"):
            lines = response_text.split('\n')
            # Remove first line (```json or ```)
            lines = lines[1:]
            # Remove last line (```)
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response_text = '\n'.join(lines).strip()

        # Try to find JSON object in text (look for first { and last })
        if not response_text.startswith('{') and not response_text.startswith('['):
            # Search for JSON object
            import re
            json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', response_text)
            if json_match:
                response_text = json_match.group(1)

        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"[LLM ERROR] Failed to parse JSON: {e}")
            print(f"[LLM ERROR] Response text: {response_text[:500]}...")
            raise ValueError(f"LLM did not return valid JSON: {str(e)}")


# Global instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create global LLM service instance"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
