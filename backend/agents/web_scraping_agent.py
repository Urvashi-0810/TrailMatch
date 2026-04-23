import uuid
import json
import httpx
from typing import Dict, Any, List
from loguru import logger
from utils.gemini_client import generate_json

STUDY_PARSER_SYSTEM_PROMPT = """You are a clinical trial data parser. Your job is to convert raw
ClinicalTrials.gov API study data into clean, structured trial formats.

You will receive an array of raw study objects. Return a JSON array with one object per study.
Each object must have these exact keys:
{
  "trial_id": "<NCT ID>",
  "trial_name": "<brief title>",
  "description": "<official title or brief description>",
  "phase": "<Phase 1|Phase 2|Phase 3|Phase 4|Not Applicable>",
  "status": "recruiting",
  "included_conditions": ["<condition1>", ...],
  "age_min": <integer, default 18>,
  "age_max": <integer, default 75>,
  "location": "<primary location or 'Multiple Locations'>",
  "drug_name": "<intervention name or 'Investigational Drug'>",
  "drug_class": "<drug class or 'Therapeutic'>",
  "side_effects": ["<known side effect>", ...],
  "enrollment_target": <integer>,
  "duration_months": <integer estimate>,
  "source": "ClinicalTrials.gov"
}

Rules:
- Return one object per input study, in the same order.
- Extract all available fields from the raw study data.
- If a field is missing, use sensible defaults.
- For age_min/age_max, parse strings like "18 Years" into integers.
- For side_effects, if none listed, use ["Study specific"].
- Return ONLY a valid JSON array."""

FALLBACK_TRIALS_SYSTEM_PROMPT = """You are a clinical trial data specialist. When the ClinicalTrials.gov
API is unavailable, generate realistic mock clinical trial data for testing purposes.

You will receive a patient condition. Return a JSON array of 2-3 realistic trial objects:
[
  {
    "trial_id": "<MOCK-xxxxxx>",
    "trial_name": "<realistic trial name for the condition>",
    "description": "<realistic trial description>",
    "phase": "<Phase 2 or Phase 3>",
    "status": "recruiting",
    "included_conditions": ["<condition>"],
    "age_min": <integer>,
    "age_max": <integer>,
    "location": "<realistic location>",
    "drug_name": "<realistic drug name>",
    "drug_class": "<drug class>",
    "side_effects": ["<side effect>", ...],
    "enrollment_target": <integer>,
    "duration_months": <integer>,
    "source": "Mock Data"
  }
]

Rules:
- Make the trials medically realistic for the given condition.
- Use varied phases, locations, and drug names.
- Generate unique MOCK-xxxxxx IDs.
- Return ONLY a valid JSON array."""


class WebScrapingAgent:
    """
    Agent responsible for discovering clinical trials from ClinicalTrials.gov
    based on patient conditions. Uses Gemini LLM for study data parsing and
    fallback trial generation.
    """

    def __init__(self):
        self.logger = logger
        self.agent_id = "web_scraping_agent"
        self.role = "Clinical Trial Discovery Specialist"
        self.base_url = "https://clinicaltrials.gov/api/v2/studies"

    async def scrape_clinical_trials(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        self.logger.info("[WebScrapingAgent] Searching clinical trials")

        try:
            conditions = patient_data.get("conditions", [])
            if not conditions:
                return {
                    "trials": [],
                    "total_found": 0,
                    "message": "No conditions provided"
                }

            primary_condition = conditions[0].lower()

            params = {
                "query.cond": primary_condition,
                "filter.overallStatus": "RECRUITING",
                "pageSize": 10,
            }

            self.logger.info(
                f"[WebScrapingAgent] Querying ClinicalTrials.gov for: {primary_condition}"
            )

            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()

            trials = []
            studies = data.get("studies", [])
            if studies:
                trials = self._process_all_studies(studies)

            self.logger.info(f"[WebScrapingAgent] Found {len(trials)} trials")

            return {
                "trials": trials,
                "total_found": len(trials),
                "search_condition": primary_condition,
                "source": "ClinicalTrials.gov API",
            }

        except Exception as e:
            self.logger.warning(
                f"[WebScrapingAgent] API failed, using fallback trials: {str(e)}"
            )
            return self._create_fallback_trials(patient_data)

    def _process_all_studies(self, studies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Use a single Gemini LLM call to parse all studies at once."""
        try:
            prompt = f"Parse these {len(studies)} ClinicalTrials.gov studies into structured format:\n\n{json.dumps(studies, indent=2, default=str)}"
            result = generate_json(STUDY_PARSER_SYSTEM_PROMPT, prompt)
            if isinstance(result, list):
                return [t for t in result if t]
            return [result] if result else []
        except Exception as e:
            self.logger.warning(f"[WebScrapingAgent] Failed to process studies: {str(e)}")
            return []

    def _create_fallback_trials(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use Gemini LLM to generate realistic fallback trials."""
        conditions = patient_data.get("conditions", [])
        primary_condition = conditions[0] if conditions else "general condition"

        try:
            prompt = f"Generate realistic mock clinical trials for a patient with: {primary_condition}"
            mock_trials = generate_json(FALLBACK_TRIALS_SYSTEM_PROMPT, prompt)
            if not isinstance(mock_trials, list):
                mock_trials = [mock_trials]
        except Exception as e:
            self.logger.warning(f"[WebScrapingAgent] Fallback LLM failed: {str(e)}")
            mock_trials = [
                {
                    "trial_id": f"MOCK-{uuid.uuid4().hex[:6]}",
                    "trial_name": f"{primary_condition.title()} Treatment Study",
                    "description": f"Clinical trial studying {primary_condition}",
                    "phase": "Phase 3",
                    "status": "recruiting",
                    "included_conditions": [primary_condition],
                    "age_min": 18,
                    "age_max": 75,
                    "location": "Multiple locations",
                    "drug_name": "Investigational Drug",
                    "drug_class": "Therapeutic",
                    "side_effects": ["Nausea", "Fatigue"],
                    "enrollment_target": 200,
                    "duration_months": 24,
                    "source": "Mock Data",
                }
            ]

        return {
            "trials": mock_trials,
            "total_found": len(mock_trials),
            "search_condition": primary_condition,
            "fallback": True,
        }

    def get_info(self) -> Dict[str, str]:
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "data_source": "ClinicalTrials.gov",
            "method": "Gemini LLM trial parsing",
            "async_supported": True,
        }


__all__ = ["WebScrapingAgent"]