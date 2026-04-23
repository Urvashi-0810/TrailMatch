import { Shield, Lock, Eye, Server } from "lucide-react"

const securityFeatures = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: "HIPAA Compliant",
    description: "Meets healthcare data standards",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "End-to-End Encrypted",
    description: "Your data is always protected",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Anonymized Analysis",
    description: "PII automatically removed",
  },
  {
    icon: <Server className="h-5 w-5" />,
    title: "Data Decoupling",
    description: "Records stored separately",
  },
]

export function SecurityBanner() {
  return (
    <section className="border-y border-border bg-card/50 px-4 py-8">
      <div className="container mx-auto">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data Security Guarantee
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {securityFeatures.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                {feature.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
