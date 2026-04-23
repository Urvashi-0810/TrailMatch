import uuid
import re
from typing import Dict, Any


class AnonymizationUtils:
    """
    Utility class for anonymizing patient data and generating patient IDs.
    """

    def __init__(self):
        pass

    # ---------------------------------------------------
    # Generate unique patient ID
    # ---------------------------------------------------

    def generate_patient_id(self) -> str:
        """
        Generate anonymized patient UUID
        """
        return f"PAT-{uuid.uuid4().hex[:10].upper()}"

    # ---------------------------------------------------
    # Remove PII fields
    # ---------------------------------------------------

    def anonymize_patient_data(self, profile: Dict[str, Any], patient_id: str):

        cleaned_profile = {}

        # Remove PII fields if present
        pii_fields = [
            "name",
            "full_name",
            "phone",
            "email",
            "address",
            "ssn",
            "aadhaar",
            "contact"
        ]

        for key, value in profile.items():

            if key.lower() in pii_fields:
                continue

            cleaned_profile[key] = value

        # Additional text anonymization
        cleaned_profile = self._remove_pii_from_text(cleaned_profile)

        cleaned_profile["patient_id"] = patient_id

        return cleaned_profile

    # ---------------------------------------------------
    # Regex PII removal from text fields
    # ---------------------------------------------------

    def _remove_pii_from_text(self, data: Dict[str, Any]) -> Dict[str, Any]:

        phone_pattern = r"\b\d{10}\b"
        email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

        for key, value in data.items():

            if isinstance(value, str):

                value = re.sub(phone_pattern, "[REDACTED_PHONE]", value)

                value = re.sub(email_pattern, "[REDACTED_EMAIL]", value)

                data[key] = value

        return data