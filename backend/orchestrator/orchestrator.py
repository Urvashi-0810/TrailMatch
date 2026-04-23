import uuid
import time
from datetime import datetime
from typing import Dict, Any, Optional

from loguru import logger

from agents.ingestion_agent import IngestionAgent
from agents.extraction_agent import MedicalExtractionAgent
from agents.anonymization_agent import AnonymizationAgent
from agents.web_scraping_agent import WebScrapingAgent
from agents.trial_parser_agent import TrialParserAgent
from agents.matching_agent import MatchingAgent
from agents.explanation_agent import ExplanationAgent
from agents.report_agent import ReportAgent

from models.schemas import (
    PatientDataInput,
    WorkflowState,
    ProcessingStatus,
    AnonymizedPatientProfile,
    ClinicalTrial,
    TrialCriteria
)


class ClinicalTrialOrchestrator:
    """
    Main orchestrator coordinating all agents in the clinical trial matching workflow.

    Pipeline:
    1. Ingestion Agent
    2. Medical Extraction Agent
    3. Anonymization Agent
    4. Web Scraping Agent
    5. Trial Parser Agent
    6. Matching Agent
    7. Explanation Agent
    8. Report Agent
    """

    def __init__(self):

        self.logger = logger

        self.orchestrator_id = f"orchestrator-{uuid.uuid4().hex[:8]}"

        self.ingestion_agent = IngestionAgent()

        self.extraction_agent = MedicalExtractionAgent()

        self.anonymization_agent = AnonymizationAgent()

        self.web_scraping_agent = WebScrapingAgent()

        self.trial_parser_agent = TrialParserAgent()

        self.matching_agent = MatchingAgent()

        self.explanation_agent = ExplanationAgent()

        self.report_agent = ReportAgent()

        self.workflows: Dict[str, WorkflowState] = {}

        self.logger.info(f"Orchestrator initialized: {self.orchestrator_id}")

    async def execute_workflow(
        self,
        patient_data: PatientDataInput,
        include_explanation: bool = True,
        generate_pdf: bool = False
    ) -> Dict[str, Any]:

        workflow_id = f"WF-{uuid.uuid4().hex[:8].upper()}"

        start_time = time.time()

        self.logger.info(f"Starting workflow {workflow_id}")

        try:

            workflow_state = WorkflowState(

                workflow_id=workflow_id,

                status=ProcessingStatus.PROCESSING,

                step="initialization",

                created_at=datetime.utcnow(),

                updated_at=datetime.utcnow()
            )

            self.workflows[workflow_id] = workflow_state

            # -----------------------------
            # STEP 1 – INGESTION
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 1 - Ingestion")

            ingestion_result = await self.ingestion_agent.ingest_patient_data(
                patient_data
            )

            if not ingestion_result.get("success"):

                return self._create_error_response(
                    workflow_id,
                    ingestion_result.get("error")
                )

            raw_data = ingestion_result.get("raw_data")

            workflow_state.step = "extraction"

            # -----------------------------
            # STEP 2 – MEDICAL EXTRACTION
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 2 - Extraction")

            extraction_result = await self.extraction_agent.extract_medical_profile(
                raw_data
            )

            if not extraction_result.get("success"):

                return self._create_error_response(
                    workflow_id,
                    extraction_result.get("error")
                )

            extracted_profile = extraction_result.get("extracted_profile")

            workflow_state.step = "anonymization"

            # -----------------------------
            # STEP 3 – ANONYMIZATION
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 3 - Anonymization")

            anonymization_result = await self.anonymization_agent.anonymize_patient_data(
                extraction_result
            )

            if not anonymization_result.get("success"):

                return self._create_error_response(
                    workflow_id,
                    anonymization_result.get("error")
                )

            patient_id = anonymization_result.get("patient_id")

            anonymized_profile = anonymization_result.get("anonymized_profile")

            patient_profile_obj = AnonymizedPatientProfile(**anonymized_profile)

            workflow_state.step = "trial_discovery"

            # -----------------------------
            # STEP 4 – TRIAL DISCOVERY
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 4 - Web Scraping")

            scraping_result = await self.web_scraping_agent.scrape_clinical_trials(
                anonymized_profile
            )

            scraped_trials = scraping_result.get("trials", [])

            if not scraped_trials:

                return self._create_error_response(
                    workflow_id,
                    "No clinical trials discovered"
                )

            workflow_state.step = "trial_parsing"

            # -----------------------------
            # STEP 5 – TRIAL PARSING (batched – single LLM call)
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 5 - Trial Parsing (batch)")

            trials_to_parse = []
            for trial_data in scraped_trials:
                eligibility_text = f"""
                Inclusion: Patients aged {trial_data.get('age_min')} to {trial_data.get('age_max')}
                with {', '.join(trial_data.get('included_conditions', []))}.
                """
                trials_to_parse.append({
                    "trial_id": trial_data.get("trial_id"),
                    "eligibility_text": eligibility_text,
                })

            parse_results = await self.trial_parser_agent.parse_all_trials(trials_to_parse)

            # Build a lookup from trial_id -> parsed criteria
            parsed_criteria_map = {
                r.get("trial_id"): r for r in parse_results if r.get("success")
            }

            parsed_trials = []
            for trial_data in scraped_trials:
                trial_id = trial_data.get("trial_id")
                trial_parse_result = parsed_criteria_map.get(trial_id)
                if trial_parse_result:
                    criteria = TrialCriteria(**trial_parse_result.get("criteria", {}))

                    trial = ClinicalTrial(

                        trial_id=trial_id,

                        trial_name=trial_data.get("trial_name"),

                        description=trial_data.get("description"),

                        phase=trial_data.get("phase"),

                        status=trial_data.get("status"),

                        criteria=criteria,

                        location=trial_data.get("location"),

                        drug_name=trial_data.get("drug_name"),

                        drug_class=trial_data.get("drug_class"),

                        potential_side_effects=trial_data.get("side_effects"),

                        enrollment_target=trial_data.get("enrollment_target"),

                        duration_months=trial_data.get("duration_months"),

                        sponsor="ClinicalTrials.gov"
                    )

                    parsed_trials.append(trial)

            if not parsed_trials:

                return self._create_error_response(
                    workflow_id,
                    "No valid trials after parsing"
                )

            workflow_state.step = "matching"

            # -----------------------------
            # STEP 6 – MATCHING
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 6 - Matching")

            matching_result = await self.matching_agent.match_patient_to_trials(
                patient_profile_obj,
                parsed_trials
            )

            if not matching_result.get("success"):

                return self._create_error_response(
                    workflow_id,
                    matching_result.get("error")
                )

            workflow_state.step = "explanation"

            # -----------------------------
            # STEP 7 – EXPLANATION
            # -----------------------------

            explanations = {"explanations": []}

            if include_explanation:

                self.logger.info(f"{workflow_id}: Step 7 - Explanation")

                explanations = await self.explanation_agent.generate_explanations(
                    matching_result,
                    patient_id
                )

            workflow_state.step = "report_generation"

            # -----------------------------
            # STEP 8 – REPORT GENERATION
            # -----------------------------

            self.logger.info(f"{workflow_id}: Step 8 - Report")

            report_result = await self.report_agent.generate_report(
                patient_id,
                matching_result,
                explanations,
                patient_profile=extracted_profile,
                include_pdf=generate_pdf
            )

            processing_time = (time.time() - start_time) * 1000

            workflow_state.status = ProcessingStatus.COMPLETED

            workflow_state.updated_at = datetime.utcnow()

            # ---- Build frontend-shaped response ----

            # Lookup maps for enriching match data
            scraped_map = {t.get("trial_id"): t for t in scraped_trials}
            explanation_map = {}
            for exp in explanations.get("explanations", []):
                explanation_map[exp.get("trial_id")] = exp

            # Patient object
            patient = {
                "patient_id": patient_id,
                "age": anonymized_profile.get("age"),
                "gender": anonymized_profile.get("gender"),
                "conditions": anonymized_profile.get("conditions", []),
                "medications": anonymized_profile.get("medications", []),
                "allergies": anonymized_profile.get("allergies", []),
            }

            # Trial matches array
            trial_matches = []
            for match in matching_result.get("matches", []):
                tid = match.get("trial_id")
                scraped = scraped_map.get(tid, {})
                explanation = explanation_map.get(tid, {})

                # Resolve nct_id: prefer tid if NCT-prefixed, else check scraped data
                nct_id = None
                if tid and tid.upper().startswith("NCT"):
                    nct_id = tid
                elif scraped.get("nct_id"):
                    nct_id = scraped.get("nct_id")

                # Derive clinical_trials_url from resolved nct_id
                clinical_trials_url = (
                    f"https://clinicaltrials.gov/study/{nct_id}" if nct_id else None
                )

                # long_term_effects from the LLM explanation agent
                long_term_effects = explanation.get("long_term_effects", [])

                trial_matches.append({
                    "trial_id": tid,
                    "nct_id": nct_id,
                    "trial_name": match.get("trial_name"),
                    "phase": scraped.get("phase"),
                    "match_score": match.get("eligibility_score"),
                    "confidence_score": match.get("eligibility_score"),
                    "is_eligible": match.get("is_eligible"),
                    "sponsor": scraped.get("source", "ClinicalTrials.gov"),
                    "study_type": "Interventional",
                    "disease_category": ", ".join(scraped.get("included_conditions", [])),
                    "location": scraped.get("location"),
                    "distance_miles": None,
                    "duration_months": scraped.get("duration_months"),
                    "eligibility": {
                        "matched_criteria": match.get("matched_criteria", []),
                        "requires_verification": match.get("unmatched_criteria", []),
                        "excluded_criteria": [],
                    },
                    "risks": {
                        "potential_risks": match.get("risk_factors", []),
                        "side_effects": scraped.get("side_effects", []),
                        "long_term_effects": long_term_effects,
                    },
                    "details": {
                        "intervention": scraped.get("drug_name"),
                        "compensation": None,
                        "trial_duration": f"{scraped.get('duration_months', 'N/A')} months",
                        "locations": [scraped.get("location")] if scraped.get("location") else [],
                        "study_contacts": [],
                        "study_summary": scraped.get("description", ""),
                    },
                    "actions": {
                        "clinical_trials_url": clinical_trials_url,
                        "can_express_interest": True,
                        "alerts_available": True,
                    },
                    "explanation": {
                        "summary": explanation.get("summary", ""),
                        "overall_assessment": explanation.get("overall_assessment", ""),
                        "next_steps": explanation.get("next_steps", ""),
                        "detailed_explanations": explanation.get("detailed_explanations", []),
                    },
                })

            # Report object
            report_json = report_result.get("report_json", {})
            report = {
                "report_id": report_result.get("report_id"),
                "executive_summary": report_json.get("executive_summary", ""),
                "patient_summary": report_json.get("patient_summary", ""),
                "trial_recommendations": report_json.get("trial_recommendations", []),
                "risk_summary": report_json.get("risk_summary", ""),
                "conclusion": report_json.get("conclusion", ""),
            }

            return {
                "success": True,
                "workflow_id": workflow_id,
                "status": ProcessingStatus.COMPLETED,
                "processing_time_ms": processing_time,
                "patient": patient,
                "trial_matches": trial_matches,
                "report": report,
            }

        except Exception as e:

            self.logger.error(f"{workflow_id}: Workflow failed: {str(e)}")

            return self._create_error_response(workflow_id, str(e))

    def _create_error_response(self, workflow_id: str, error: str):

        return {

            "success": False,

            "workflow_id": workflow_id,

            "error": error,

            "status": ProcessingStatus.FAILED
        }


# Global orchestrator instance

_orchestrator: Optional[ClinicalTrialOrchestrator] = None


def get_orchestrator() -> ClinicalTrialOrchestrator:

    global _orchestrator

    if _orchestrator is None:

        _orchestrator = ClinicalTrialOrchestrator()

    return _orchestrator


__all__ = ["ClinicalTrialOrchestrator", "get_orchestrator"]