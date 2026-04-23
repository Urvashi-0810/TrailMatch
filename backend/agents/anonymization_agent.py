from typing import Dict, Any
from loguru import logger
from datetime import datetime

from utils.anonymization import AnonymizationUtils 
from models.schemas import AnonymizedPatientProfile


class AnonymizationAgent:
    """
    Agent responsible for removing PII and generating anonymized patient profiles.
    """

    def __init__(self):

        self.logger = logger
        self.agent_id = "anonymization_agent"
        self.role = "Privacy Preservation Specialist"

        self.utils = AnonymizationUtils()

    async def anonymize_patient_data(self, extracted_data: Dict[str, Any], patient_id: str = None):

        self.logger.info("[AnonymizationAgent] Starting anonymization")

        try:

            if not patient_id:
                patient_id = self.utils.generate_patient_id()

            self.logger.info(f"[AnonymizationAgent] Patient ID assigned: {patient_id}")

            profile = extracted_data.get("extracted_profile", extracted_data)

            anonymized_profile = self.utils.anonymize_patient_data(profile, patient_id)

            anonymized = AnonymizedPatientProfile(

                patient_id=patient_id,

                age=anonymized_profile.get("age", 0),

                gender=anonymized_profile.get("gender", "Unknown"),

                weight_kg=anonymized_profile.get("weight_kg"),

                height_cm=anonymized_profile.get("height_cm"),

                bmi=self._calculate_bmi(
                    anonymized_profile.get("weight_kg"),
                    anonymized_profile.get("height_cm")
                ),

                conditions=[anonymized_profile.get("disease", "Unknown")] if anonymized_profile.get("disease") else [],

                lab_results=anonymized_profile.get("lab_results", {}),

                medications=anonymized_profile.get("medications", []),

                allergies=anonymized_profile.get("allergies", []),

                smoking_status=anonymized_profile.get("smoking_status"),

                alcohol_use=anonymized_profile.get("alcohol_use"),

                anonymized_at=datetime.utcnow()
            )

            self.logger.info(f"[AnonymizationAgent] Completed for {patient_id}")

            return {

                "success": True,

                "patient_id": patient_id,

                "anonymized_profile": anonymized.model_dump()
            }

        except Exception as e:

            self.logger.error(f"[AnonymizationAgent] Failed: {str(e)}")

            return {

                "success": False,

                "error": str(e)
            }

    @staticmethod
    def _calculate_bmi(weight_kg: float, height_cm: float):

        if not weight_kg or not height_cm:

            return None

        height_m = height_cm / 100

        bmi = weight_kg / (height_m ** 2)

        return round(bmi, 2)

    def get_info(self):

        return {

            "agent_id": self.agent_id,

            "role": self.role,

            "features": [

                "UUID generation",

                "PII removal",

                "Regex + NER detection"
            ]
        }


__all__ = ["AnonymizationAgent"]