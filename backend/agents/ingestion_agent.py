from typing import Dict, Any, Union, List
from loguru import logger
import json
import base64
import pandas as pd
import pdfplumber
from PIL import Image
from io import BytesIO
import os
import shutil

from models.schemas import PatientDataInput

try:
    import pytesseract
    # Configure Tesseract with fallback
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
    else:
        pytesseract.pytesseract.tesseract_cmd = shutil.which("tesseract")
except Exception as e:
    logger.warning(f"[IngestionAgent] Tesseract not available: {e}")
    pytesseract = None

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
                self.logger.warning("[IngestionAgent] No content provided")
                return {
                    "success": False,
                    "error": "No content provided"
                }

            data_type = patient_data.data_type.lower()
            self.logger.debug(f"[IngestionAgent] Data type: {data_type}")

            if data_type == "json":
                raw_data = await self._process_json_data(patient_data.content)
            elif data_type == "pdf":
                raw_data = await self._process_pdf_data(patient_data.content)
            elif data_type == "image":
                raw_data = await self._process_image_data(patient_data.content)
            elif data_type == "excel":
                raw_data = await self._process_excel_data(patient_data.content)
            else:
                self.logger.error(f"[IngestionAgent] Unsupported data type: {data_type}")
                return {
                    "success": False,
                    "error": f"Unsupported data type: {data_type}"
                }

            # Validate extracted data
            if not raw_data:
                self.logger.error(f"[IngestionAgent] No data extracted from {data_type}")
                return {
                    "success": False,
                    "error": f"Failed to extract data from {data_type}"
                }

            raw_data["source"] = data_type

            # Log extraction success metrics
            extracted_text_length = len(raw_data.get("extracted_text", ""))
            self.logger.info(
                f"[IngestionAgent] Successfully processed {data_type} - extracted {extracted_text_length} characters"
            )

            return {
                "success": True,
                "raw_data": raw_data
            }

        except Exception as e:
            self.logger.error(
                f"[IngestionAgent] Ingestion failed: {type(e).__name__}: {str(e)}",
                exc_info=True
            )
            return {
                "success": False,
                "error": str(e)
            }

    # -----------------------------
    # JSON PROCESSING
    # -----------------------------

    async def _process_json_data(self, content: Union[str, Dict, Any]):
        """Process JSON data - handles both string and dict inputs"""
        try:
            # Handle if content is already a dict
            if isinstance(content, dict):
                self.logger.debug("[IngestionAgent] JSON content is already a dict")
                data = content
            elif isinstance(content, str):
                self.logger.debug("[IngestionAgent] Parsing JSON string")
                data = json.loads(content)
            else:
                raise TypeError(f"Expected str or dict, got {type(content).__name__}")

            # Validate it's not empty
            if not data:
                raise ValueError("JSON content is empty")

            # Convert to string representation
            extracted_text = json.dumps(data, indent=2) if isinstance(data, dict) else str(data)

            self.logger.debug(f"[IngestionAgent] JSON parsed successfully - {len(extracted_text)} characters")

            return {
                "data_type": "json",
                "content": data,
                "extracted_text": extracted_text
            }
        except json.JSONDecodeError as je:
            self.logger.error(
                f"[IngestionAgent] Invalid JSON format: {str(je)}",
                exc_info=True
            )
            raise ValueError(f"Invalid JSON: {str(je)}")
        except Exception as e:
            self.logger.error(
                f"[IngestionAgent] JSON processing failed: {type(e).__name__}: {str(e)}",
                exc_info=True
            )
            raise

    # -----------------------------
    # PDF PROCESSING
    # -----------------------------

    async def _process_pdf_data(self, content: str):
        """Extract text from PDF with comprehensive error handling"""
        try:
            self.logger.debug("[IngestionAgent] Decoding PDF content")
            pdf_bytes = base64.b64decode(content)
            self.logger.debug(f"[IngestionAgent] PDF size: {len(pdf_bytes)} bytes")

            text = ""
            page_count = 0

            try:
                with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
                    page_count = len(pdf.pages)
                    self.logger.debug(f"[IngestionAgent] PDF has {page_count} pages")

                    for idx, page in enumerate(pdf.pages, 1):
                        try:
                            page_text = page.extract_text()
                            if page_text:
                                text += page_text + "\n"
                                self.logger.debug(f"[IngestionAgent] Extracted {len(page_text)} chars from page {idx}")
                            else:
                                self.logger.debug(f"[IngestionAgent] Page {idx} returned empty text")
                        except Exception as page_e:
                            self.logger.warning(f"[IngestionAgent] Failed to extract page {idx}: {str(page_e)}")
                            continue

            except pdfplumber.PDFException as pdf_e:
                self.logger.error(
                    f"[IngestionAgent] PDF parsing error (likely corrupted): {str(pdf_e)}",
                    exc_info=True
                )
                raise ValueError(f"Invalid or corrupted PDF: {str(pdf_e)}")

            # Validate extracted text
            if not text.strip():
                self.logger.warning("[IngestionAgent] No text extracted from PDF")
                text = "[PDF contained no extractable text]"

            self.logger.info(f"[IngestionAgent] PDF extraction complete: {page_count} pages, {len(text)} characters")

            return {
                "data_type": "pdf",
                "extracted_text": text,
                "file_size": len(pdf_bytes),
                "page_count": page_count
            }
        except base64.binascii.Error as be:
            self.logger.error(
                f"[IngestionAgent] Invalid base64 PDF content: {str(be)}",
                exc_info=True
            )
            raise ValueError("Invalid base64 encoding for PDF")
        except Exception as e:
            self.logger.error(
                f"[IngestionAgent] PDF processing failed: {type(e).__name__}: {str(e)}",
                exc_info=True
            )
            raise

    # -----------------------------
    # IMAGE PROCESSING (OCR)
    # -----------------------------

    async def _process_image_data(self, content: str):
        """Extract text from image using OCR with fallback handling"""
        try:
            self.logger.debug("[IngestionAgent] Decoding image content")
            image_bytes = base64.b64decode(content)
            self.logger.debug(f"[IngestionAgent] Image size: {len(image_bytes)} bytes")

            # Validate image format
            try:
                image = Image.open(BytesIO(image_bytes))
                image_format = image.format
                image_size = image.size
                self.logger.info(
                    f"[IngestionAgent] Image detected: {image_format} {image_size[0]}x{image_size[1]}"
                )
            except Exception as img_e:
                self.logger.error(
                    f"[IngestionAgent] Invalid image format: {str(img_e)}",
                    exc_info=True
                )
                raise ValueError(f"Invalid or corrupted image: {str(img_e)}")

            # Check if Tesseract is available
            if pytesseract is None:
                self.logger.warning("[IngestionAgent] Tesseract not available, returning image info only")
                return {
                    "data_type": "image",
                    "extracted_text": f"[Image: {image_format} {image_size[0]}x{image_size[1]} - OCR not available]",
                    "file_size": len(image_bytes),
                    "image_format": image_format,
                    "image_dimensions": image_size,
                    "ocr_available": False
                }

            # Perform OCR
            try:
                self.logger.debug("[IngestionAgent] Starting OCR with Tesseract")
                text = pytesseract.image_to_string(image)
                
                if not text.strip():
                    self.logger.warning("[IngestionAgent] OCR returned no text")
                    text = "[OCR found no readable text in image]"
                
                self.logger.info(f"[IngestionAgent] OCR complete: {len(text)} characters extracted")

                return {
                    "data_type": "image",
                    "extracted_text": text,
                    "file_size": len(image_bytes),
                    "image_format": image_format,
                    "image_dimensions": image_size,
                    "ocr_available": True
                }
            except pytesseract.TesseractNotFoundError as te:
                self.logger.error(
                    f"[IngestionAgent] Tesseract not found: {str(te)}",
                    exc_info=True
                )
                raise ValueError("Tesseract OCR engine not found. Please install Tesseract-OCR.")
            except Exception as ocr_e:
                self.logger.error(
                    f"[IngestionAgent] OCR processing failed: {type(ocr_e).__name__}: {str(ocr_e)}",
                    exc_info=True
                )
                raise

        except base64.binascii.Error as be:
            self.logger.error(
                f"[IngestionAgent] Invalid base64 image content: {str(be)}",
                exc_info=True
            )
            raise ValueError("Invalid base64 encoding for image")
        except Exception as e:
            self.logger.error(
                f"[IngestionAgent] Image processing failed: {type(e).__name__}: {str(e)}",
                exc_info=True
            )
            raise

    # -----------------------------
    # EXCEL PROCESSING
    # -----------------------------

    async def _process_excel_data(self, content: str):
        """Process Excel files - handles all sheets with comprehensive validation"""
        try:
            self.logger.debug("[IngestionAgent] Decoding Excel content")
            excel_bytes = base64.b64decode(content)
            self.logger.debug(f"[IngestionAgent] Excel file size: {len(excel_bytes)} bytes")

            # Read all sheets
            try:
                excel_file = pd.ExcelFile(BytesIO(excel_bytes))
                sheet_names = excel_file.sheet_names
                self.logger.info(f"[IngestionAgent] Excel has {len(sheet_names)} sheet(s): {sheet_names}")
            except Exception as excel_e:
                self.logger.error(
                    f"[IngestionAgent] Failed to read Excel file: {str(excel_e)}",
                    exc_info=True
                )
                raise ValueError(f"Invalid or corrupted Excel file: {str(excel_e)}")

            # Process all sheets
            all_data = []
            text_parts = []

            for sheet_name in sheet_names:
                try:
                    self.logger.debug(f"[IngestionAgent] Processing sheet: {sheet_name}")
                    df = pd.read_excel(BytesIO(excel_bytes), sheet_name=sheet_name)
                    
                    # Validate sheet has data
                    if df.empty:
                        self.logger.warning(f"[IngestionAgent] Sheet '{sheet_name}' is empty")
                        continue
                    
                    # Log sheet info
                    self.logger.info(
                        f"[IngestionAgent] Sheet '{sheet_name}': {len(df)} rows, {len(df.columns)} columns"
                    )
                    
                    # Convert to structured data
                    sheet_records = df.to_dict(orient="records")
                    all_data.extend(sheet_records)
                    
                    # Add text representation
                    text_parts.append(f"\n--- Sheet: {sheet_name} ---\n")
                    text_parts.append(df.to_string())
                    
                except Exception as sheet_e:
                    self.logger.error(
                        f"[IngestionAgent] Failed to process sheet '{sheet_name}': {str(sheet_e)}",
                        exc_info=True
                    )
                    continue

            # Validate extracted data
            if not all_data:
                self.logger.error("[IngestionAgent] No valid data found in any sheet")
                raise ValueError("Excel file contains no valid data")

            extracted_text = "\n".join(text_parts)
            self.logger.info(
                f"[IngestionAgent] Excel extraction complete: {len(all_data)} records, {len(extracted_text)} characters"
            )

            return {
                "data_type": "excel",
                "content": all_data,
                "extracted_text": extracted_text,
                "rows": len(all_data),
                "sheets": len(sheet_names)
            }
        except base64.binascii.Error as be:
            self.logger.error(
                f"[IngestionAgent] Invalid base64 Excel content: {str(be)}",
                exc_info=True
            )
            raise ValueError("Invalid base64 encoding for Excel file")
        except Exception as e:
            self.logger.error(
                f"[IngestionAgent] Excel processing failed: {type(e).__name__}: {str(e)}",
                exc_info=True
            )
            raise

    # -----------------------------
    # INFO
    # -----------------------------

    def get_info(self):
        """Return agent information and capabilities"""
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "supported_formats": {
                "json": "Structured JSON data (dict or string)",
                "pdf": "PDF documents with text extraction",
                "image": "Image files (PNG, JPG, etc.) with OCR",
                "excel": "Excel files (.xlsx) with multi-sheet support"
            },
            "features": {
                "error_handling": "Comprehensive with fallbacks",
                "logging": "Detailed extraction metrics",
                "validation": "Content validation for all formats",
                "ocr_support": pytesseract is not None
            }
        }


__all__ = ["IngestionAgent"]