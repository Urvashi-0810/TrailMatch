import { Key, UserX, Database, AlertTriangle, CheckCircle2 } from "lucide-react"

const privacyFeatures = [
  {
    icon: <Key className="h-8 w-8" />,
    title: "UUID Anonymization",
    description: "Every patient record is assigned a unique identifier. Your real identity is never stored alongside your medical data.",
  },
  {
    icon: <UserX className="h-8 w-8" />,
    title: "Automatic PII Removal",
    description: "Names, phone numbers, addresses, emails, and identification numbers are automatically detected and removed using advanced regex patterns.",
  },
  {
    icon: <Database className="h-8 w-8" />,
    title: "Data Decoupling",
    description: "Medical data is stored completely separate from any identity information, making it impossible to trace records back to individuals.",
  },
  {
    icon: <AlertTriangle className="h-8 w-8" />,
    title: "User Warnings",
    description: "Clear notifications before uploading medical reports and when leaving during active analysis, ensuring you understand data processing.",
  },
]

const compliance = [
  "HIPAA Compliant Infrastructure",
  "GDPR Data Protection",
  "SOC 2 Type II Certified",
  "256-bit AES Encryption",
  "Regular Security Audits",
  "Zero-Knowledge Architecture",
]

export function PrivacySection() {
  return (
    <section id="privacy" className="px-4 py-20 md:py-32">
      <div className="container mx-auto">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Your Privacy is Our Priority
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ve built every aspect of our platform with patient privacy and data security as the foundation.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {privacyFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-5 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                {feature.icon}
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance badges */}
        <div className="mx-auto mt-16 max-w-4xl rounded-xl border border-success/30 bg-success/5 p-8">
          <h3 className="mb-6 text-center text-lg font-semibold text-foreground">
            Compliance & Certifications
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {compliance.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
