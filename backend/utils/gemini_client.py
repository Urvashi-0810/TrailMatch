import os
import json
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

_client = None
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
MAX_RETRIES = 3


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not set. Add it to your .env file."
            )

        _client = genai.Client(api_key=api_key)

        logger.info(f"Gemini API client initialized (model: {MODEL_NAME})")

    return _client


def generate_json(system_instruction: str, prompt: str) -> dict:
    """Send prompt to Gemini and return parsed JSON response."""

    client = _get_client()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    {
                        "role": "user",
                        "parts": [{"text": prompt}],
                    }
                ],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                    max_output_tokens=4096,
                    response_mime_type="application/json",
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str and attempt < MAX_RETRIES:
                wait = 15 * attempt
                logger.warning(f"Rate limited, retrying in {wait}s (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(wait)
            else:
                raise


def generate_text(system_instruction: str, prompt: str) -> str:
    """Send a prompt to Gemini and return raw text."""
    client = _get_client()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                    max_output_tokens=4096,
                ),
            )
            return response.text
        except Exception as e:
            err_str = str(e)
            if "429" in err_str and attempt < MAX_RETRIES:
                wait = 15 * attempt
                logger.warning(f"Rate limited, retrying in {wait}s (attempt {attempt}/{MAX_RETRIES})")
                time.sleep(wait)
            else:
                raise


def parse_json_response(text: str) -> dict:
    """Parse JSON from Gemini response, stripping markdown fences if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    return json.loads(text)
