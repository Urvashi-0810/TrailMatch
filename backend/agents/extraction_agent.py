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

            if data_type == "json":
                content = raw_data.get("content", {})
                prompt = f"Extract the medical profile from this structured patient data:\n{json.dumps(content, indent=2)}"
            elif data_type in ["pdf", "image"]:
                text = raw_data.get("extracted_text", "")
                prompt = f"Extract the medical profile from this clinical text:\n{text}"
            else:
                raise ValueError("Unsupported raw data format")

            profile = generate_json(EXTRACTION_SYSTEM_PROMPT, prompt)

            self.logger.info(
                f"[ExtractionAgent] Extraction complete: {profile.get('disease', 'Unknown')}"
            )

            return {
                "success": True,
                "extracted_profile": profile,
                "extraction_method": data_type
            }

        except Exception as e:

            self.logger.error(f"[ExtractionAgent] Extraction failed: {str(e)}")

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