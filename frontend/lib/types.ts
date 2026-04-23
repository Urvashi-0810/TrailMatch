export interface MedicalData {
  id: string
  conditions: string[]
  medications: string[]
  allergies: string[]
  labResults: { name: string; value: string; unit: string; status: "normal" | "high" | "low" }[]
  demographics: { age: number; gender: string }
}

export interface TrialMatch {
  id: string
  name: string
  phase: string
  matchPercentage: number
  confidenceScore: number
  location: string
  sponsor: string
  description: string
  matchedCriteria: string[]
  unmatchedCriteria: string[]
  potentialRisks: string[]
  longTermImpact: string
}

export interface TreatmentOption {
  id: string
  name: string
  type: string
  successRate: number
  description: string
  benefits: string[]
  risks: string[]
  alternatives: string[]
}

export interface MedicalCondition {
  id: string
  name: string
  severity: "mild" | "moderate" | "severe"
  diagnosisDate?: string
  status: "active" | "managed" | "resolved"
  icdCode?: string
  description?: string
}

export interface ClinicalTrial {
  id: string
  nctId: string
  title: string
  sponsor: string
  phase: "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4"
  status: "Recruiting" | "Active" | "Completed" | "Not yet recruiting"
  matchScore: number
  condition: string
  location: {
    city: string
    state: string
    country: string
    facility: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  distance?: string
  eligibilityCriteria: {
    inclusion: string[]
    exclusion: string[]
  }
  description: string
  startDate: string
  estimatedEndDate: string
  enrollment: number
  primaryOutcome: string
  secondaryOutcomes?: string[]
  contactInfo: {
    name: string
    phone: string
    email: string
  }
}

export interface Treatment {
  id: string
  name: string
  type: "medication" | "procedure" | "therapy" | "surgery" | "lifestyle"
  description: string
  effectiveness: number
  sideEffects: string[]
  contraindications: string[]
  averageCost?: string
  insuranceCoverage?: "typically covered" | "varies" | "rarely covered"
  duration?: string
  frequency?: string
}

export interface AnalysisResult {
  id: string
  patientId?: string
  createdAt: string
  status: "processing" | "complete" | "error"
  conditions: MedicalCondition[]
  matchedTrials: ClinicalTrial[]
  recommendedTreatments: Treatment[]
  summary: {
    totalConditions: number
    totalTrials: number
    highMatchTrials: number
    urgentActions: string[]
  }
}

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: "uploading" | "processing" | "complete" | "error"
  progress: number
  extractedData?: string[]
}

export interface FilterOptions {
  phase: string[]
  status: string[]
  distance: string
  matchScore: number
  condition: string
}

export interface MapLocation {
  id: string
  name: string
  type: "hospital" | "clinic" | "research_center"
  coordinates: {
    lat: number
    lng: number
  }
  address: string
  trials: number
  distance?: string
}
