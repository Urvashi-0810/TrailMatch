"""Quick smoke test for BioBERT-based MatchingAgent."""
import asyncio
from datetime import datetime
from agents.matching_agent import MatchingAgent
from models.schemas import AnonymizedPatientProfile, ClinicalTrial, TrialCriteria

agent = MatchingAgent()

patient = AnonymizedPatientProfile(
    patient_id="PT-TEST-001",
    age=52, gender="male", bmi=28.5,
    conditions=["type 2 diabetes"],
    lab_results={"HbA1c": 8.1, "Cholesterol": 205},
    medications=["metformin"],
    allergies=["penicillin"],
    anonymized_at=datetime.utcnow(),
)

diabetes_trial = ClinicalTrial(
    trial_id="NCT001", trial_name="DIABETES_STUDY",
    description="Diabetes study", phase="Phase 3", status="recruiting",
    criteria=TrialCriteria(
        age_min=30, age_max=65,
        included_conditions=["type 2 diabetes"], excluded_conditions=[],
        excluded_medications=["warfarin"], bmi_min=18.5, bmi_max=35.0,
    ),
    location="NYC", drug_name="Drug A", drug_class="SGLT2",
    potential_side_effects=["nausea"], enrollment_target=200,
    duration_months=12, sponsor="Lab",
)

cancer_trial = ClinicalTrial(
    trial_id="NCT002", trial_name="CANCER_IMMUNOTHERAPY",
    description="Cancer immunotherapy", phase="Phase 2", status="recruiting",
    criteria=TrialCriteria(
        age_min=18, age_max=70,
        included_conditions=["lung cancer", "breast cancer"],
        excluded_conditions=["heart disease"],
        excluded_medications=["aspirin"],
    ),
    location="Boston", drug_name="Drug B", drug_class="PD-1",
    potential_side_effects=["fatigue"], enrollment_target=150,
    duration_months=18, sponsor="Pharma",
)

result = asyncio.run(agent.match_patient_to_trials(patient, [diabetes_trial, cancer_trial]))
print("Success:", result["success"])
print("Total trials evaluated:", result["total_trials_evaluated"])
print()
for m in result["matches"]:
    print(f"  {m['trial_name']}: score={m['eligibility_score']}, eligible={m['is_eligible']}")
    print(f"    matched: {m['matched_criteria']}, unmatched: {m['unmatched_criteria']}")
    print(f"    details count: {len(m['details'])}, risk_factors: {m['risk_factors']}")
    print(f"    recommendations: {m['recommendations'][:80]}")
    print()

# Sanity check: diabetes trial should score higher than cancer trial
scores = {m["trial_name"]: m["eligibility_score"] for m in result["matches"]}
assert scores["DIABETES_STUDY"] > scores["CANCER_IMMUNOTHERAPY"], (
    f"Expected diabetes trial to score higher. Got: {scores}"
)
print("SANITY CHECK PASSED: Diabetes trial scored higher than cancer trial.")
