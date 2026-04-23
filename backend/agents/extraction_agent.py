import json
from typing import Dict, Any, List
from loguru import logger
from utils.gemini_client import generate_json

EXTRACTION_SYSTEM_PROMPT = """You are a medical data extraction specialist. Your job is to extract
structured patient medical information from raw clinical text or structured data.

Always return a JSON object with these exact keys:
{
  "age": <integer, 0 if unknown>,
  "gender": "<Male|Female|Unknown>",
  "disease": "<primary diagnosis string>",
  "lab_results": {"<test_name>": <numeric_value>, ...},
  "medications": ["<medication_name>", ...],
  "allergies": ["<allergy>", ...],
  "weight_kg": <float or null>,
  "height_cm": <float or null>
}

Rules:
- Extract ALL lab results mentioned, with numeric values only.
- Extract ALL medications, capitalize each word.
- Extract ALL allergies mentioned.
- For age, extract the numeric age in years.
- For gender, normalize to "Male", "Female", or "Unknown".
- For disease, identify the primary condition/diagnosis.
- If a field cannot be determined, use the default (0, "", {}, [], or null).
- Return ONLY valid JSON. No extra text."""


class MedicalExtractionAgent:
    """
    Converts raw patient data into structured medical profile using Gemini LLM.
    """

    def __init__(self):
        self.logger = logger
        self.agent_id = "extraction_agent"
        self.role = "Medical Data Extraction Specialist"

    async def extract_medical_profile(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:

        self.logger.info("[ExtractionAgent] Starting extraction")

        try:

            data_type = raw_data.get("data_type")
            self.logger.debug(f"[ExtractionAgent] Data type: {data_type}")

            if data_type == "json":
                content = raw_data.get("content", {})
                prompt = f"Extract the medical profile from this structured patient data:\n{json.dumps(content, indent=2)}"
                self.logger.debug(f"[ExtractionAgent] Processing structured JSON data")
            elif data_type in ["pdf", "image"]:
                text = raw_data.get("extracted_text", "")
                prompt = f"Extract the medical profile from this clinical text:\n{text}"
                self.logger.debug(f"[ExtractionAgent] Processing {data_type.upper()} - text length: {len(text)} chars")
            else:
                raise ValueError("Unsupported raw data format")

            profile = generate_json(EXTRACTION_SYSTEM_PROMPT, prompt)

            # Validate the extracted profile
            if not isinstance(profile, dict):
                self.logger.warning(f"[ExtractionAgent] Extraction returned unexpected type: {type(profile)}")
                profile = {}
            
            disease = profile.get("disease", "").strip()
            self.logger.info(
                f"[ExtractionAgent] Extraction complete: disease='{disease}', age={profile.get('age')}, gender={profile.get('gender')}"
            )

            return {
                "success": True,
                "extracted_profile": profile,
                "extraction_method": data_type
            }

        except Exception as e:

            self.logger.error(
                f"[ExtractionAgent] Extraction failed: {type(e).__name__}: {str(e)}",
                exc_info=True
            )

            return {
                "success": False,
                "error": str(e)
            }

    def get_info(self):

        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "extraction_method": "Gemini LLM"
        }