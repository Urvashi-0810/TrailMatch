from typing import Dict, Any, List
from loguru import logger
import json
from models.schemas import TrialCriteria
from utils.gemini_client import generate_json

TRIAL_PARSER_SYSTEM_PROMPT = """You are a clinical trial eligibility criteria parser. Your job is to
convert free-text eligibility descriptions into structured criteria.

You will receive one or more trials. Return a JSON array where each element corresponds to one trial:
[
  {
    "trial_id": "<the trial_id provided>",
    "age_min": <integer or null>,
    "age_max": <integer or null>,
    "gender": ["M", "F"] or null,
    "included_conditions": ["condition1", ...],
    "excluded_conditions": ["condition1", ...],
    "excluded_medications": ["medication1", ...],
    "bmi_min": <float or null>,
    "bmi_max": <float or null>,
    "inclusion_text": "<extracted inclusion criteria text>",
    "exclusion_text": "<extracted exclusion criteria text>"
  }
]

Rules:
- Return one object per trial, in the same order as the input.
- Parse BOTH inclusion and exclusion criteria carefully.
- included_conditions: conditions the patient MUST have to participate.
- excluded_conditions: conditions that DISQUALIFY a patient.
- excluded_medications: medications that DISQUALIFY a patient.
- Gender should be a list of "M" and/or "F", or null if not specified.
- If a value cannot be determined from the text, use null (for scalars) or [] (for lists).
- Return ONLY a valid JSON array."""


class TrialParserAgent:
    """
    Converts clinical trial eligibility text into structured criteria using Gemini LLM.
    """

    def __init__(self):
        self.logger = logger
        self.agent_id = "trial_parser_agent"
        self.role = "Clinical Trial Criteria Parser"

    async def parse_trial_eligibility(self, trial_text: str, trial_id: str = "UNKNOWN") -> Dict[str, Any]:
        """Parse a single trial (delegates to batch method)."""
        results = await self.parse_all_trials([{"trial_id": trial_id, "eligibility_text": trial_text}])
        if results and results[0].get("success"):
            return results[0]
        return {"success": False, "trial_id": trial_id, "error": "Parsing failed"}

    async def parse_all_trials(self, trials: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse all trials in a single Gemini call."""

        self.logger.info(f"[TrialParserAgent] Batch parsing {len(trials)} trials")

        try:
            trials_input = [
                {"trial_id": t.get("trial_id", "UNKNOWN"), "eligibility_text": t.get("eligibility_text", "")}
                for t in trials
            ]

            prompt = f"Parse the following {len(trials_input)} clinical trial eligibility texts into structured criteria:\n\n{json.dumps(trials_input, indent=2)}"

            parsed_list = generate_json(TRIAL_PARSER_SYSTEM_PROMPT, prompt)

            if not isinstance(parsed_list, list):
                parsed_list = [parsed_list]

            results = []
            for parsed in parsed_list:
                try:
                    criteria = TrialCriteria(
                        age_min=parsed.get("age_min"),
                        age_max=parsed.get("age_max"),
                        gender=parsed.get("gender"),
                        included_conditions=parsed.get("included_conditions", []),
                        excluded_conditions=parsed.get("excluded_conditions", []),
                        excluded_medications=parsed.get("excluded_medications", []),
                        bmi_min=parsed.get("bmi_min"),
                        bmi_max=parsed.get("bmi_max"),
                    )
                    results.append({
                        "success": True,
                        "trial_id": parsed.get("trial_id", "UNKNOWN"),
                        "criteria": criteria.model_dump(),
                        "inclusion_text": parsed.get("inclusion_text", ""),
                        "exclusion_text": parsed.get("exclusion_text", ""),
                    })
                except Exception as e:
                    self.logger.warning(f"[TrialParserAgent] Failed to parse one trial: {e}")

            self.logger.info(f"[TrialParserAgent] Batch parsing completed: {len(results)} trials")
            return results

        except Exception as e:
            self.logger.error(f"[TrialParserAgent] Batch parsing failed: {str(e)}")
            return []

    def get_info(self):
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "method": "Gemini LLM criteria extraction",
        }


__all__ = ["TrialParserAgent"]