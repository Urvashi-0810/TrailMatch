from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# ==================== Patient Models ====================

class LabResult(BaseModel):
    """Laboratory test result"""
    test_name: str
    value: float
    unit: str
    reference_range: Optional[str] = None
    test_date: Optional[datetime] = None

class MedicalCondition(BaseModel):
    """Medical condition or diagnosis"""
    name: str
    severity: Optional[str] = None
    diagnosis_date: Optional[datetime] = None

class PatientMedicalProfile(BaseModel):
    """Structured patient medical profile"""
    age: int
    gender: str  # M, F, Other
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    bmi: Optional[float] = None
    conditions: List[MedicalCondition]
    lab_results: List[LabResult]
    medications: List[str]
    allergies: List[str]
    smoking_status: Optional[str] = None
    alcohol_use: Optional[str] = None

class AnonymizedPatientProfile(BaseModel):
    """Anonymized patient profile with UUID"""
    patient_id: str  # UUID format
    age: int
    gender: str
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    bmi: Optional[float] = None
    conditions: List[str]
    lab_results: Dict[str, float]
    medications: List[str]
    allergies: List[str]
    smoking_status: Optional[str] = None
    alcohol_use: Optional[str] = None
    anonymized_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "PT-550e8400-e29b-41d4-a716-446655440000",
                "age": 52,
                "gender": "male",
                "conditions": ["type 2 diabetes"],
                "lab_results": {"HbA1c": 8.1},
                "medications": ["metformin"],
                "allergies": []
            }
        }

# ==================== Clinical Trial Models ====================

class TrialCriteria(BaseModel):
    """Structured clinical trial eligibility criteria"""
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    gender: Optional[List[str]] = None
    included_conditions: List[str]
    excluded_conditions: List[str]
    required_lab_tests: Optional[Dict[str, Dict[str, float]]] = None  # {test_name: {min: value, max: value}}
    excluded_medications: Optional[List[str]] = None
    excluded_allergies: Optional[List[str]] = None
    bmi_min: Optional[float] = None
    bmi_max: Optional[float] = None

class ClinicalTrial(BaseModel):
    """Clinical trial information"""
    trial_id: str
    trial_name: str
    description: str
    phase: str  # Phase 1, 2, 3, 4
    status: str  # recruiting, active, completed
    criteria: TrialCriteria
    location: str
    drug_name: str
    drug_class: str
    potential_side_effects: List[str]
    enrollment_target: int
    duration_months: int
    sponsor: str
    contact_email: Optional[str] = None

# ==================== Matching Models ====================

class EligibilityMatch(BaseModel):
    """Single eligibility criterion match result"""
    criterion: str
    matched: bool
    explanation: str
    confidence_score: float

class TrialMatchResult(BaseModel):
    """Trial matching result for a patient"""
    trial_id: str
    trial_name: str
    eligibility_score: float  # 0-1
    is_eligible: bool
    matched_criteria: List[str]
    unmatched_criteria: List[str]
    details: List[EligibilityMatch]
    risk_factors: List[str]
    recommendations: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "trial_id": "T001",
                "trial_name": "DIABETES_STUDY_2024",
                "eligibility_score": 0.87,
                "is_eligible": True,
                "matched_criteria": ["age", "disease"],
                "unmatched_criteria": ["BMI"],
                "details": [
                    {
                        "criterion": "Age Range",
                        "matched": True,
                        "explanation": "Patient age 52 is within range 30-65",
                        "confidence_score": 0.99
                    }
                ],
                "risk_factors": ["High HbA1c"],
                "recommendations": "Monitor glucose levels closely"
            }
        }

# ==================== Explanation Models ====================

class ExplanationDetail(BaseModel):
    """Detailed explanation for a decision"""
    criterion: str
    status: str  # matched, not_matched, warning
    reasoning: str
    confidence: float

class PatientTrialExplanation(BaseModel):
    """Explainable reasoning for patient-trial matching"""
    patient_id: str
    trial_id: str
    trial_name: str
    summary: str
    detailed_explanations: List[ExplanationDetail]
    overall_assessment: str
    next_steps: str

# ==================== Report Models ====================

class ClinicalReport(BaseModel):
    """Clinical trial matching report"""
    report_id: str
    patient_id: str
    created_at: datetime
    top_matches: List[TrialMatchResult]
    patient_profile_summary: Dict[str, Any]
    explanations: List[PatientTrialExplanation]
    generated_by: str = "ClinicalTrialMatcher"
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": "RPT-123456",
                "patient_id": "PT-550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2024-03-06T10:30:00Z",
                "top_matches": [],
                "patient_profile_summary": {},
                "explanations": []
            }
        }

# ==================== Request/Response Models ====================

class PatientDataInput(BaseModel):
    """Patient data input for processing"""
    data_type: str  # pdf, image, json
    content: str  # base64 encoded or JSON string
    metadata: Optional[Dict[str, Any]] = None

class TrialDataInput(BaseModel):
    """Clinical trial data input"""
    trial_id: str
    trial_name: str
    eligibility_text: str
    location: str
    drug_name: str
    drug_class: str
    side_effects: List[str]
    enrollment_target: int
    duration_months: int

class MatchingRequest(BaseModel):
    """Request to match patient with trials"""
    patient_id: str
    patient_data: AnonymizedPatientProfile
    trials: List[ClinicalTrial]

class MatchingResponse(BaseModel):
    """Response with matching results"""
    patient_id: str
    matches: List[TrialMatchResult]
    report: ClinicalReport
    status: str = ProcessingStatus.COMPLETED
    processing_time_ms: float

# ==================== Workflow Models ====================

class WorkflowState(BaseModel):
    """State of processing workflow"""
    workflow_id: str
    patient_id: Optional[str] = None
    status: ProcessingStatus
    step: str
    raw_data: Optional[str] = None
    extracted_data: Optional[PatientMedicalProfile] = None
    anonymized_data: Optional[AnonymizedPatientProfile] = None
    matches: Optional[List[TrialMatchResult]] = None
    report: Optional[ClinicalReport] = None
    errors: List[str] = []
    created_at: datetime
    updated_at: datetime

class WorkflowRequest(BaseModel):
    """Request to start workflow"""
    patient_data: PatientDataInput
    trials: List[TrialDataInput]
    include_explanation: bool = True
    generate_pdf: bool = False
