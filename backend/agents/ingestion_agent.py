from typing import Dict, Any
from loguru import logger
import json
import base64
import pandas as pd
import pdfplumber
from PIL import Image
from io import BytesIO

from models.schemas import PatientDataInput
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class IngestionAgent:
    """
    Agent responsible for ingesting patient data from structured and unstructured sources.

    Supported inputs:
    - JSON (structured)
    - Excel (.xlsx structured)
    - PDF (unstructured text extraction)
    - Image (OCR extraction)
    """

    def __init__(self):

        self.logger = logger

        self.agent_id = "ingestion_agent"

        self.role = "Data Ingestion and Validation Specialist"

    async def ingest_patient_data(self, patient_data: PatientDataInput) -> Dict[str, Any]:

        self.logger.info(f"[IngestionAgent] Processing {patient_data.data_type}")

        try:

            if not patient_data.content:

                return {
                    "success": False,
                    "error": "No content provided"
                }

            data_type = patient_data.data_type.lower()

            if data_type == "json":

                raw_data = await self._process_json_data(patient_data.content)

            elif data_type == "pdf":

                raw_data = await self._process_pdf_data(patient_data.content)

            elif data_type == "image":

                raw_data = await self._process_image_data(patient_data.content)

            elif data_type == "excel":

                raw_data = await self._process_excel_data(patient_data.content)

            else:

                return {
                    "success": False,
                    "error": f"Unsupported data type: {data_type}"
                }

            raw_data["source"] = data_type

            self.logger.info(f"[IngestionAgent] Successfully processed {data_type}")

            return {
                "success": True,
                "raw_data": raw_data
            }

        except Exception as e:

            self.logger.error(f"[IngestionAgent] Failed: {str(e)}")

            return {
                "success": False,
                "error": str(e)
            }

    # -----------------------------
    # JSON PROCESSING
    # -----------------------------

    async def _process_json_data(self, content: str):

        data = json.loads(content)

        return {
            "data_type": "json",
            "content": data,
            "extracted_text": json.dumps(data)
        }

    # -----------------------------
    # PDF PROCESSING
    # -----------------------------

    async def _process_pdf_data(self, content: str):

        pdf_bytes = base64.b64decode(content)

        text = ""

        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:

                    text += page_text + "\n"

        return {
            "data_type": "pdf",
            "extracted_text": text,
            "file_size": len(pdf_bytes)
        }

    # -----------------------------
    # IMAGE PROCESSING (OCR)
    # -----------------------------

    async def _process_image_data(self, content: str):

        image_bytes = base64.b64decode(content)

        image = Image.open(BytesIO(image_bytes))

        text = pytesseract.image_to_string(image)

        return {
            "data_type": "image",
            "extracted_text": text,
            "file_size": len(image_bytes)
        }

    # -----------------------------
    # EXCEL PROCESSING
    # -----------------------------

    async def _process_excel_data(self, content: str):

        excel_bytes = base64.b64decode(content)

        df = pd.read_excel(BytesIO(excel_bytes))

        structured_data = df.to_dict(orient="records")

        text_representation = df.to_string()

        return {
            "data_type": "excel",
            "content": structured_data,
            "extracted_text": text_representation,
            "rows": len(df)
        }

    # -----------------------------
    # INFO
    # -----------------------------

    def get_info(self):

        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "supported_formats": [
                "JSON",
                "PDF",
                "Image (OCR)",
                "Excel (.xlsx)"
            ]
        }


__all__ = ["IngestionAgent"]