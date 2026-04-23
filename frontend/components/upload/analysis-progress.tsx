"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface AnalysisProgressProps {
  progress: number
  step: string
}

export function AnalysisProgress({ progress, step }: AnalysisProgressProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="py-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Analyzing Your Medical Profile</h2>
            <p className="text-muted-foreground">
              {step || "Processing your data..."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Please do not close this page while analysis is in progress.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
