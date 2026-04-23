import json
from typing import Dict, Any, List
from loguru import logger
from models.schemas import PatientTrialExplanation, ExplanationDetail
from utils.gemini_client import generate_json

EXPLANATION_SYSTEM_PROMPT = """You are a clinical trial explainability specialist. Your job is to generate
clear, human-readable explanations for why a patient matches or does not match clinical trials.

You will receive an array of patient-trial match results. Return a JSON array where each element
corresponds to one match result, in the same order:
[
  {
    "trial_id": "<trial_id from the match>",
    "summary": "<1-2 sentence summary of the match/no-match decision>",
    "detailed_explanations": [
      {
        "criterion": "<criterion name>",
        "status": "<matched|not_matched|warning>",
        "reasoning": "<clear explanation of why this criterion was met or not>",
        "confidence": <float 0-1>
      }
    ],
    "overall_assessment": "<paragraph assessing overall eligibility, mentioning key matched/unmatched criteria and risk factors>",
    "next_steps": "<actionable next steps for the clinician, numbered list as a string>",
    "long_term_effects": ["<potential long-term effect of the trial intervention based on the drug, condition, and known medical literature>"]
  }
]

Rules:
- Return one explanation per match, in the same order as the input.
- Write in a professional, clinical tone suitable for healthcare providers.
- Be specific: reference actual patient values and trial thresholds when available.
- For eligible patients with high scores (>=0.9), recommend direct enrollment.
- For eligible patients with moderate scores (0.7-0.9), recommend screening visit.
- For ineligible patients, suggest alternative actions and retesting timelines.
- Always mention identified risk factors in the assessment.
- For long_term_effects, list 2-4 plausible long-term effects of the trial drug/intervention
  based on the drug class, mechanism, and patient condition. If insufficient information, return
  general effects for the drug class.
- Return ONLY a valid JSON array."""


class ExplanationAgent:
    """
    Agent responsible for generating transparent, explainable reasoning using Gemini LLM.
    """

    def __init__(self):
        self.logger = logger
        self.agent_id = "explanation_agent"
        self.role = "Explainability & Reasoning Specialist"

    async def generate_explanations(self, matching_results: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
        self.logger.info(f"Generating explanations for {patient_id}")

        try:
            matches = matching_results.get("matches", [])
            if not matches:
                return {"success": True, "patient_id": patient_id, "explanations": []}

            # Single batched Gemini call for all matches
            prompt = (
                f"Generate clinical explanations for these {len(matches)} patient-trial match results:\n\n"
                f"{json.dumps(matches, indent=2, default=str)}"
            )

            parsed_list = generate_json(EXPLANATION_SYSTEM_PROMPT, prompt)
            if not isinstance(parsed_list, list):
                parsed_list = [parsed_list]

            explanations = []
            for i, parsed in enumerate(parsed_list):
                match = matches[i] if i < len(matches) else {}
                detailed_explanations = []
                for d in parsed.get("detailed_explanations", []):
                    detailed_explanations.append(ExplanationDetail(
                        criterion=d.get("criterion", "Unknown"),
                        status=d.get("status", "not_matched"),
                        reasoning=d.get("reasoning", ""),
                        confidence=d.get("confidence", 0.0),
                    ))

                trial_name = match.get("trial_name", "Unknown Trial")
                result = PatientTrialExplanation(
                    patient_id=patient_id,
                    trial_id=parsed.get("trial_id", match.get("trial_id", "Unknown")),
                    trial_name=trial_name,
                    summary=parsed.get("summary", ""),
                    detailed_explanations=detailed_explanations,
                    overall_assessment=parsed.get("overall_assessment", ""),
                    next_steps=parsed.get("next_steps", ""),
                )
                exp_dict = result.model_dump() if hasattr(result, "model_dump") else result.dict()
                exp_dict["long_term_effects"] = parsed.get("long_term_effects", [])
                explanations.append(exp_dict)

            self.logger.info(f"Generated {len(explanations)} explanations")

            return {
                "success": True,
                "patient_id": patient_id,
                "explanations": explanations
            }

        except Exception as e:
            self.logger.error(f"Explanation generation failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_info(self) -> Dict[str, str]:
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "outputs": ["human-readable explanations", "risk assessments", "actionable next steps"]
        }


__all__ = ["ExplanationAgent"]
