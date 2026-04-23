import uuid
import json
from typing import Dict, Any
from datetime import datetime
from loguru import logger
from utils.gemini_client import generate_json

REPORT_SYSTEM_PROMPT = """You are a clinical report generation specialist. Your job is to produce a
comprehensive, professional clinical trial matching report.

You will receive:
- patient_profile: the anonymized patient medical profile
- matching_results: trial match scores and eligibility details
- explanations: detailed explanations for each match

Return a JSON object with these exact keys:
{
  "executive_summary": "<2-3 paragraph overview of findings, key recommendations, and overall assessment>",
  "patient_summary": "<concise summary of the patient's medical profile relevant to trial matching>",
  "trial_recommendations": [
    {
      "trial_id": "<id>",
      "trial_name": "<name>",
      "recommendation": "<Strongly Recommended|Recommended|Consider|Not Recommended>",
      "rationale": "<1-2 sentence rationale>"
    }
  ],
  "risk_summary": "<summary of all identified risk factors across trials>",
  "conclusion": "<final clinical conclusion and suggested next steps>"
}

Rules:
- Write in a professional, clinical tone suitable for healthcare providers.
- Be specific and reference actual patient data and trial criteria.
- Rank trials from most to least recommended.
- Always identify and summarize risk factors.
- Return ONLY valid JSON."""


class ReportAgent:
    """
    Agent responsible for assembling the final patient report using Gemini LLM.
    """

    def __init__(self):
        self.logger = logger
        self.agent_id = "report_agent"
        self.role = "Report Generation Specialist"

    async def generate_report(
        self,
        patient_id: str,
        matching_results: Dict[str, Any],
        explanations: Dict[str, Any],
        patient_profile: Dict[str, Any] = None,
        include_pdf: bool = False,
    ) -> Dict[str, Any]:

        self.logger.info(f"[ReportAgent] Generating report for patient {patient_id}")

        try:
            report_id = f"report-{uuid.uuid4().hex[:8]}"

            prompt = (
                "Generate a clinical trial matching report from this data:\n\n"
                f"Patient Profile:\n{json.dumps(patient_profile, indent=2, default=str)}\n\n"
                f"Matching Results:\n{json.dumps(matching_results, indent=2, default=str)}\n\n"
                f"Explanations:\n{json.dumps(explanations.get('explanations', []), indent=2, default=str)}"
            )

            llm_report = generate_json(REPORT_SYSTEM_PROMPT, prompt)

            report_json: Dict[str, Any] = {
                "report_id": report_id,
                "patient_id": patient_id,
                "generated_at": datetime.utcnow().isoformat(),
                "executive_summary": llm_report.get("executive_summary", ""),
                "patient_summary": llm_report.get("patient_summary", ""),
                "trial_recommendations": llm_report.get("trial_recommendations", []),
                "risk_summary": llm_report.get("risk_summary", ""),
                "conclusion": llm_report.get("conclusion", ""),
            }

            pdf_data = None
            if include_pdf:
                pdf_data = f"PDF content placeholder for {report_id}"
                report_json["pdf"] = pdf_data

            self.logger.info(f"[ReportAgent] Report generated successfully: {report_id}")

            return {
                "success": True,
                "report_id": report_id,
                "report_json": report_json,
                "pdf_data": pdf_data,
            }

        except Exception as e:
            self.logger.error(f"[ReportAgent] Report generation failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_info(self):
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "outputs": [
                "patient trial matching report",
                "clinical explanations",
                "trial eligibility summary"
            ]
        }


__all__ = ["ReportAgent"]