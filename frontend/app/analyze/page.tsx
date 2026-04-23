"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Heart,
  Pill,
  Activity,
  FileText,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { UploadZone } from "@/components/upload/upload-zone"
import { PatientFormEntry } from "@/components/upload/patient-form"
import { AnalysisProgress } from "@/components/upload/analysis-progress"
import { PrivacyWarning } from "@/components/upload/privacy-warning"
import { analyzeFile, analyzePatient } from "@/lib/api"
import { generateReportPdf } from "@/lib/generate-pdf"

type AnalysisState = "idle" | "input" | "processing" | "results"

interface AnalysisResults {
  trials: any[]
  explanations: any[]
  risks: any[]
  patientProfile: any
}

export default function AnalyzePage() {
  const [state, setstate] = useState<AnalysisState>("idle")
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTrial, setSelectedTrial] = useState<any>(null)
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(true)
  const [processingStep, setProcessingStep] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)

  const handlePrivacyAccepted = () => {
    setShowPrivacyWarning(false)
    setstate("input")
  }

  const handleFilesUploaded = async (files: File[]) => {
    setstate("processing")
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      setProcessingStep("Ingesting patient data...")
      setProcessingProgress(15)

      // Analyze each file and combine results
      const responses = await Promise.all(
        files.map((file) => analyzeFile(file))
      )

      setProcessingStep("Extracting medical profile...")
      setProcessingProgress(40)

      setProcessingStep("Matching with clinical trials...")
      setProcessingProgress(70)

      // Use the first response as primary
      if (responses[0]) {
        const analysisData = responses[0]
        setResults({
          trials: analysisData.trial_matches || [],
          explanations: analysisData.trial_matches?.map((trial: any) => ({
            trial_name: trial.trial_name,
            explanation: trial.explanation?.summary || "",
            criteria_analysis: trial.explanation?.detailed_explanations || [],
          })) || [],
          risks: analysisData.trial_matches?.map((trial: any) => ({
            trial_name: trial.trial_name,
            risk_summary: trial.explanation?.overall_assessment || "",
            identified_risks: [
              ...(trial.risks?.side_effects || []),
              ...(trial.risks?.long_term_effects || []),
            ],
          })) || [],
          patientProfile: analysisData.patient || {},
        })
        setstate("results")
      }

      setProcessingProgress(100)
    } catch (error) {
      console.error("Analysis failed:", error)
      setstate("input")
      setIsProcessing(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    setstate("processing")
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      setProcessingStep("Processing patient data...")
      setProcessingProgress(15)

      const response = await analyzePatient(formData)

      setProcessingStep("Extracting medical profile...")
      setProcessingProgress(40)

      setProcessingStep("Matching with clinical trials...")
      setProcessingProgress(70)

      if (response) {
        const analysisData = response
        setResults({
          trials: analysisData.trial_matches || [],
          explanations: analysisData.trial_matches?.map((trial: any) => ({
            trial_name: trial.trial_name,
            explanation: trial.explanation?.summary || "",
            criteria_analysis: trial.explanation?.detailed_explanations || [],
          })) || [],
          risks: analysisData.trial_matches?.map((trial: any) => ({
            trial_name: trial.trial_name,
            risk_summary: trial.explanation?.overall_assessment || "",
            identified_risks: [
              ...(trial.risks?.side_effects || []),
              ...(trial.risks?.long_term_effects || []),
            ],
          })) || [],
          patientProfile: analysisData.patient || {},
        })
        setstate("results")
      }

      setProcessingProgress(100)
    } catch (error) {
      console.error("Analysis failed:", error)
      setstate("input")
      setIsProcessing(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!results) return

    try {
      const reportData: any = {
        patient: results.patientProfile,
        trial_matches: results.trials,
        status: "success",
        success: true,
        workflow_id: "workflow-" + Date.now(),
        processing_time_ms: 0,
        report: {
          report_id: "report-" + Date.now(),
          executive_summary: "Analysis of clinical trial matches for the anonymized patient profile.",
          patient_summary: `Patient profile analyzed with ${results.patientProfile.conditions?.length || 0} medical conditions.`,
          trial_recommendations: results.trials.slice(0, 3).map((trial: any) => ({
            trial_id: trial.trial_id,
            trial_name: trial.trial_name,
            recommendation: trial.is_eligible ? "RECOMMENDED" : "NOT_RECOMMENDED",
            rationale: trial.explanation?.summary || "",
          })),
          risk_summary: results.risks.map((r: any) => r.risk_summary).join(" "),
          conclusion: "Consult with your healthcare provider before enrolling in any trial.",
        },
      }

      const pdfDoc = generateReportPdf(reportData as any)
      pdfDoc.save("trial-match-report.pdf")
    } catch (error) {
      console.error("Failed to download report:", error)
    }
  }

  const handleNewAnalysis = () => {
    setstate("input")
    setResults(null)
    setSelectedTrial(null)
    setProcessingProgress(0)
    setProcessingStep("")
  }

  // Show privacy warning
  if (showPrivacyWarning) {
    return (
      <div className="min-h-screen bg-background py-12">
        <PrivacyWarning onAccept={handlePrivacyAccepted} />
      </div>
    )
  }

  // Idle state - initial entry point
  if (state === "idle") {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-4 gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Clinical Trial Matching
            </Badge>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Find Your Perfect Clinical Trial
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Upload your medical records or enter your patient information to discover clinical trials
              matched to your unique medical profile. Secure, private, and transparent.
            </p>
          </div>

          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="py-8">
              <div className="grid gap-6 md:grid-cols-2">
                <button
                  onClick={() => setstate("input")}
                  className="group relative overflow-hidden rounded-lg border border-primary/20 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="relative z-10 space-y-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <h3 className="mb-2 font-semibold text-foreground">Get Started</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload files or enter data to begin your analysis
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => setstate("input")}
              size="lg"
              className="gap-2"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Input state - file upload or form entry
  if (state === "input") {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setstate("idle")}
              className="mb-4"
            >
              ← Back
            </Button>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Patient Data Input</h1>
            <p className="text-muted-foreground">
              Choose how you'd like to provide patient information
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="form">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Medical Documents</CardTitle>
                  <CardDescription>
                    Supports PDF, images (PNG/JPG), and Excel files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadZone onFilesUploaded={handleFilesUploaded} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="form" className="space-y-6 pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Patient Information</CardTitle>
                  <CardDescription>
                    Fill in your medical profile to find matching clinical trials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PatientFormEntry onSubmit={handleFormSubmit} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Processing state
  if (state === "processing" || isProcessing) {
    return (
      <div className="min-h-screen bg-background py-12">
        <AnalysisProgress progress={processingProgress} step={processingStep} />
      </div>
    )
  }

  // Results state
  if (state === "results" && results) {
    const sortedTrials = [...(results.trials || [])].sort(
      (a, b) => (b.match_score || 0) - (a.match_score || 0)
    )

    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analysis Complete</h1>
              <p className="text-muted-foreground">
                Found {sortedTrials.length} matching clinical trials
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={handleNewAnalysis} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                New Analysis
              </Button>
              <Button onClick={handleDownloadReport} className="gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Medical Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Patient Profile (Anonymized)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {results.patientProfile.age && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Age</div>
                    <div className="text-lg font-semibold text-foreground">
                      {results.patientProfile.age}
                    </div>
                  </div>
                )}
                {results.patientProfile.gender && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Gender</div>
                    <div className="text-lg font-semibold text-foreground">
                      {results.patientProfile.gender}
                    </div>
                  </div>
                )}
                {results.patientProfile.conditions && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      Conditions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {results.patientProfile.conditions.slice(0, 3).map((condition: string) => (
                        <Badge key={condition} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {results.patientProfile.medications && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Pill className="h-4 w-4" />
                      Medications
                    </div>
                    <div className="text-sm text-foreground">
                      {results.patientProfile.medications.length} medications listed
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Trials, Explanations, and Risks */}
          <Tabs defaultValue="trials" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trials" className="gap-2">
                <Activity className="h-4 w-4" />
                Trials ({sortedTrials.length})
              </TabsTrigger>
              <TabsTrigger value="explanations" className="gap-2">
                <FileText className="h-4 w-4" />
                Explanations
              </TabsTrigger>
              <TabsTrigger value="risks" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risks
              </TabsTrigger>
            </TabsList>

            {/* Trials Tab */}
            <TabsContent value="trials" className="space-y-4 pt-6">
              {sortedTrials.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <XCircle className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                    <p className="text-foreground font-semibold">No matching trials found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your medical profile or check back later
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sortedTrials.map((trial: any) => (
                  <Card
                    key={trial.trial_id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => setSelectedTrial(trial)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {trial.trial_name || "Trial"}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {trial.phase || "Phase N/A"}
                            </Badge>
                            <Badge
                              variant={trial.status === "recruiting" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {trial.status || "Unknown"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trial.details?.study_summary || "No description available"}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {trial.disease_category && (
                              <Badge variant="secondary" className="text-xs">
                                {trial.disease_category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="mb-2 text-2xl font-bold text-primary">
                            {Math.round((trial.match_score || 0) * 100)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                      </div>

                      {/* Trial Details (Collapsible) */}
                      {selectedTrial?.trial_id === trial.trial_id && (
                        <div className="mt-6 space-y-4 border-t pt-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            {trial.location && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="text-foreground">{trial.location}</p>
                              </div>
                            )}
                            {trial.sponsor && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Sponsor</p>
                                <p className="text-foreground">{trial.sponsor}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">
                              Eligibility Criteria
                            </p>
                            <p className="text-sm text-muted-foreground italic">Detailed eligibility criteria can be found on ClinicalTrials.gov.</p>
                          </div>

                          <Button asChild className="gap-2" size="sm">
                            <a
                              href={`https://clinicaltrials.gov/ct2/show/${trial.trial_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on ClinicalTrials.gov
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Explanations Tab */}
            <TabsContent value="explanations" className="space-y-4 pt-6">
              {results.explanations && results.explanations.length > 0 ? (
                results.explanations.map((explanation: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {explanation.trial_name || `Trial ${idx + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {explanation.explanation && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {explanation.explanation}
                          </p>
                        </div>
                      )}

                      {explanation.criteria_analysis && (
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">Criteria Analysis</p>
                          <div className="space-y-2">
                            {Array.isArray(explanation.criteria_analysis)
                              ? explanation.criteria_analysis.map((criterion: any, cidx: number) => (
                                  <div
                                    key={cidx}
                                    className="flex items-start gap-2 rounded-md bg-secondary/50 p-3"
                                  >
                                    {criterion.status === "matched" ? (
                                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500 mt-0.5" />
                                    ) : (
                                      <XCircle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">
                                        {criterion.name || criterion.criterion}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {criterion.details || criterion.reasoning}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              : null}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No explanations available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-4 pt-6">
              {results.risks && results.risks.length > 0 ? (
                results.risks.map((risk: any, idx: number) => (
                  <Card key={idx} className="border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        {risk.trial_name || `Trial ${idx + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {risk.risk_summary && (
                        <div className="space-y-2">
                          <p className="text-sm text-foreground">{risk.risk_summary}</p>
                        </div>
                      )}

                      {risk.identified_risks && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-foreground">Identified Risks:</p>
                          <ul className="space-y-1">
                            {Array.isArray(risk.identified_risks)
                              ? risk.identified_risks.map((r: string, ridx: number) => (
                                  <li key={ridx} className="flex gap-2 text-sm text-foreground">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                                    {r}
                                  </li>
                                ))
                              : null}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="text-foreground font-semibold">No major risks identified</p>
                    <p className="text-sm text-muted-foreground">
                      Always consult with a healthcare provider before enrolling
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return null
}
