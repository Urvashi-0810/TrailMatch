// API response types matching the backend response structure

export interface ApiPatient {
  age: number
  allergies: string[]
  conditions: string[]
  gender: string
  medications: string[]
  patient_id: string
}

export interface DetailedExplanation {
  confidence: number
  criterion: string
  reasoning: string
  status: "matched" | "not_matched" | "requires_verification"
}

export interface TrialExplanation {
  detailed_explanations: DetailedExplanation[]
  next_steps: string
  overall_assessment: string
  summary: string
}

export interface TrialRisks {
  long_term_effects: string[]
  potential_risks: string[]
  side_effects: string[]
}

export interface TrialDetails {
  compensation: string | null
  intervention: string
  locations: string[]
  study_contacts: string[]
  study_summary: string
  trial_duration: string
}

export interface TrialEligibility {
  excluded_criteria: string[]
  matched_criteria: string[]
  requires_verification: string[]
}

export interface TrialActions {
  alerts_available: boolean
  can_express_interest: boolean
  clinical_trials_url: string | null
}

export interface TrialMatch {
  actions: TrialActions
  confidence_score: number
  details: TrialDetails
  disease_category: string
  distance_miles: number | null
  duration_months: number
  eligibility: TrialEligibility
  explanation: TrialExplanation
  is_eligible: boolean
  location: string
  match_score: number
  nct_id: string | null
  phase: string
  risks: TrialRisks
  sponsor: string
  study_type: string
  trial_id: string
  trial_name: string
}

export interface TrialRecommendation {
  rationale: string
  recommendation: string
  trial_id: string
  trial_name: string
}

export interface Report {
  conclusion: string
  executive_summary: string
  patient_summary: string
  report_id: string
  risk_summary: string
  trial_recommendations: TrialRecommendation[]
}

export interface ApiResponse {
  patient: ApiPatient
  processing_time_ms: number
  report: Report
  status: string
  success: boolean
  trial_matches: TrialMatch[]
  workflow_id: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"

const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/agent/analyze`

export async function analyzeFile(file: globalThis.File): Promise<ApiResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(ANALYZE_ENDPOINT, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export async function analyzePatient(patientData: Record<string, unknown>): Promise<ApiResponse> {
  const res = await fetch(ANALYZE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}
