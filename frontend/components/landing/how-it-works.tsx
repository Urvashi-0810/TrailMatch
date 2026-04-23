import { Upload, Scan, Cpu, FileSearch, ClipboardList, Download, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: <Upload className="h-8 w-8" />,
    title: "Upload Medical Records",
    description: "Support for PDFs, scanned documents, lab reports, and images. Our smart scanner can even capture documents directly.",
    features: ["Multiple file formats", "Smart document scanner", "Batch upload support"],
  },
  {
    icon: <Scan className="h-8 w-8" />,
    title: "OCR & Data Extraction",
    description: "Advanced OCR technology combined with LLM-powered semantic analysis extracts and structures your medical information.",
    features: ["OpenOCR text extraction", "AI semantic understanding", "Structured health profiles"],
  },
  {
    icon: <Cpu className="h-8 w-8" />,
    title: "AI Analysis Engine",
    description: "Our AI agent compares your medical history with clinical trial requirements and treatment options worldwide.",
    features: ["Deep pattern matching", "Eligibility evaluation", "Risk assessment"],
  },
  {
    icon: <FileSearch className="h-8 w-8" />,
    title: "Trial & Treatment Matching",
    description: "Get personalized recommendations with detailed match percentages, eligibility breakdowns, and confidence scores.",
    features: ["Match percentage", "Criteria breakdown", "Confidence scoring"],
  },
  {
    icon: <ClipboardList className="h-8 w-8" />,
    title: "Explainable Results",
    description: "Transparent AI explanations show exactly why trials were recommended, including matched/unmatched criteria.",
    features: ["Detailed reasoning", "Long-term impact analysis", "Risk transparency"],
  },
  {
    icon: <Download className="h-8 w-8" />,
    title: "Download Report",
    description: "Generate comprehensive medical insight reports in multiple formats for your records or to share with healthcare providers.",
    features: ["PDF export", "Structured data", "Printable format"],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 md:py-32">
      <div className="container mx-auto">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From upload to insights in minutes — a streamlined workflow designed for patients and researchers.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Connection line */}
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-border md:left-1/2 md:block md:-translate-x-1/2" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative flex flex-col gap-6 md:flex-row md:gap-12 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Step number indicator */}
                <div className="absolute left-8 top-0 hidden h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-primary text-lg font-bold text-primary-foreground md:left-1/2 md:flex">
                  {index + 1}
                </div>

                {/* Content */}
                <div className={`flex-1 ${index % 2 === 1 ? "md:text-right" : ""}`}>
                  <div className={`rounded-xl border border-border bg-card p-6 shadow-sm ${index % 2 === 1 ? "md:ml-auto md:mr-12" : "md:ml-12"}`}>
                    <div className={`mb-4 flex items-center gap-4 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="mb-4 text-muted-foreground">{step.description}</p>
                    <div className={`flex flex-wrap gap-2 ${index % 2 === 1 ? "md:justify-end" : ""}`}>
                      {step.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
