"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Shield, Eye, Database, Lock, AlertTriangle } from "lucide-react"

interface PrivacyWarningProps {
  onAccept: () => void
}

const privacyPoints = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Data Anonymization",
    description: "Your records will be assigned a unique ID. No personal identifiers are stored.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "PII Removal",
    description: "Names, addresses, phone numbers, and other personal information are automatically detected and removed.",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Secure Processing",
    description: "Data is processed in isolated environments and not stored after analysis is complete.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "End-to-End Encryption",
    description: "All uploads and data transfers are protected with 256-bit AES encryption.",
  },
]

export function PrivacyWarning({ onAccept }: PrivacyWarningProps) {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="mx-4 max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl">Before You Upload</CardTitle>
          <p className="text-muted-foreground">
            Please review how we handle your medical data
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {privacyPoints.map((point) => (
              <div key={point.title} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {point.icon}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{point.title}</h4>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <h4 className="mb-2 font-medium text-foreground">Important Notice</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>- Do not upload documents containing sensitive information you wish to keep private</li>
              <li>- This platform provides AI-generated insights and is not a substitute for medical advice</li>
              <li>- Always consult with healthcare professionals before making medical decisions</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label htmlFor="accept" className="text-sm text-muted-foreground">
              I understand how my data will be processed and agree to the{" "}
              <a href="#" className="text-primary underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary underline">Privacy Policy</a>.
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onAccept} 
            disabled={!accepted}
            className="w-full"
            size="lg"
          >
            I Understand, Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
