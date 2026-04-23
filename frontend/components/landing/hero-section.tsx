"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Brain, Target, Download, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 md:pb-32 md:pt-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI-Powered Medical Analysis</span>
          </Badge>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Clinical Trial
            </span>{" "}
            Match
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Upload your medical records and let our AI analyze them to find relevant clinical trials, 
            evaluate eligibility, and suggest treatment procedures — all while keeping your data 
            completely private and secure.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href="/analyze">
                Start Matching
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/analyze">
                Explore Trials
              </Link>
            </Button> */}
          </div>
        </div>

        {/* Workflow Preview Cards */}
        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-4">
          <WorkflowCard
            step={1}
            icon={<FileText className="h-6 w-6" />}
            title="Upload Data"
            description="Medical PDFs, scans, or lab reports"
          />
          <WorkflowCard
            step={2}
            icon={<Brain className="h-6 w-6" />}
            title="AI Analysis"
            description="Advanced extraction & matching"
          />
          <WorkflowCard
            step={3}
            icon={<Target className="h-6 w-6" />}
            title="Trial Matching"
            description="Personalized recommendations"
          />
          <WorkflowCard
            step={4}
            icon={<Download className="h-6 w-6" />}
            title="Get Report"
            description="Detailed insights & options"
          />
        </div>
      </div>
    </section>
  )
}

function WorkflowCard({
  step,
  icon,
  title,
  description,
}: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -top-3 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {step}
      </div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
