"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  MapPin,
  Building,
  TrendingUp,
  Heart,
  Pill,
  Activity,
  FileText,
  ExternalLink,
  ChevronRight,
  Star,
} from "lucide-react"
import type { MedicalData, TrialMatch, TreatmentOption } from "@/lib/types"

interface AnalysisResultsProps {
  medicalData: MedicalData
  trialMatches: TrialMatch[]
  treatmentOptions: TreatmentOption[]
  onReset: () => void
}

export function AnalysisResults({
  medicalData,
  trialMatches,
  treatmentOptions,
  onReset,
}: AnalysisResultsProps) {
  const [selectedTrial, setSelectedTrial] = useState<TrialMatch | null>(null)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis Complete</h1>
          <p className="text-muted-foreground">
            Found {trialMatches.length} matching trials and {treatmentOptions.length} treatment options
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            New Analysis
          </Button>
          <Button asChild className="gap-2">
            <Link href="/report">
              <Download className="h-4 w-4" />
              Download Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Medical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Medical Summary
          </CardTitle>
          <CardDescription>Extracted from your uploaded documents (anonymized)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Heart className="h-4 w-4" />
                Conditions
              </div>
              <div className="flex flex-wrap gap-1">
                {medicalData.conditions.map((condition) => (
                  <Badge key={condition} variant="secondary">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Pill className="h-4 w-4" />
                Medications
              </div>
              <div className="flex flex-wrap gap-1">
                {medicalData.medications.map((med) => (
                  <Badge key={med} variant="outline">
                    {med}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Allergies
              </div>
              <div className="flex flex-wrap gap-1">
                {medicalData.allergies.map((allergy) => (
                  <Badge key={allergy} variant="destructive" className="bg-destructive/10 text-destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4" />
                Key Lab Results
              </div>
              <div className="space-y-1">
                {medicalData.labResults.slice(0, 3).map((lab) => (
                  <div key={lab.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{lab.name}</span>
                    <Badge
                      variant="secondary"
                      className={
                        lab.status === "high"
                          ? "bg-destructive/10 text-destructive"
                          : lab.status === "low"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                      }
                    >
                      {lab.value} {lab.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="trials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trials" className="gap-2">
            <Star className="h-4 w-4" />
            Top Trial Matches ({trialMatches.length})
          </TabsTrigger>
          <TabsTrigger value="treatments" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Treatment Options ({treatmentOptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Trial Matches */}
        <TabsContent value="trials" className="space-y-4">
          {selectedTrial ? (
            <TrialDetail trial={selectedTrial} onBack={() => setSelectedTrial(null)} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {trialMatches.map((trial, index) => (
                <TrialCard
                  key={trial.id}
                  trial={trial}
                  rank={index + 1}
                  onClick={() => setSelectedTrial(trial)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Treatment Options */}
        <TabsContent value="treatments" className="space-y-4">
          {treatmentOptions.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TrialCard({
  trial,
  rank,
  onClick,
}: {
  trial: TrialMatch
  rank: number
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {rank}
            </div>
            <Badge variant="secondary">{trial.phase}</Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{trial.matchPercentage}%</div>
            <div className="text-xs text-muted-foreground">match</div>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">{trial.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{trial.description}</p>

        <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {trial.location}
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            {trial.sponsor}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3 w-3" />
              {trial.matchedCriteria.length} matched
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <XCircle className="h-3 w-3" />
              {trial.unmatchedCriteria.length} unmatched
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function TrialDetail({ trial, onBack }: { trial: TrialMatch; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back to all trials
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                {trial.phase}
              </Badge>
              <CardTitle className="text-2xl">{trial.name}</CardTitle>
              <CardDescription className="mt-2 flex flex-wrap gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trial.location}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {trial.sponsor}
                </span>
                <span className="text-muted-foreground">ID: {trial.id}</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{trial.matchPercentage}%</div>
              <div className="text-sm text-muted-foreground">Match Score</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Confidence: {trial.confidenceScore}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{trial.description}</p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Matched Criteria */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Matched Criteria
              </h4>
              <ul className="space-y-2">
                {trial.matchedCriteria.map((criteria, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-lg bg-success/5 p-2 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-foreground">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unmatched Criteria */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                Unmatched / Requires Verification
              </h4>
              <ul className="space-y-2">
                {trial.unmatchedCriteria.map((criteria, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-sm"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span className="text-muted-foreground">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Potential Risks */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Potential Risks
            </h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              {trial.potentialRisks.map((risk, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm"
                >
                  <span className="text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Long-term Impact */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Long-term Impact Prediction
            </h4>
            <p className="text-muted-foreground">{trial.longTermImpact}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View on ClinicalTrials.gov
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/trials">
                <Star className="h-4 w-4" />
                Find Similar Trials
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TreatmentCard({ treatment }: { treatment: TreatmentOption }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              {treatment.type}
            </Badge>
            <h3 className="text-xl font-semibold text-foreground">{treatment.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{treatment.successRate}%</div>
            <div className="text-xs text-muted-foreground">success rate</div>
          </div>
        </div>

        <p className="mb-4 text-muted-foreground">{treatment.description}</p>

        <div className="mb-4">
          <div className="mb-1 text-sm text-muted-foreground">Estimated Success</div>
          <Progress value={treatment.successRate} className="h-2" />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-2 text-sm">View Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pt-2 md:grid-cols-3">
                <div>
                  <h5 className="mb-2 flex items-center gap-1 text-sm font-medium text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Benefits
                  </h5>
                  <ul className="space-y-1">
                    {treatment.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="mb-2 flex items-center gap-1 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Risks
                  </h5>
                  <ul className="space-y-1">
                    {treatment.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="mb-2 text-sm font-medium text-foreground">Alternatives</h5>
                  <ul className="space-y-1">
                    {treatment.alternatives.map((alt, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
