import {
  Search,
  MapPin,
  Bell,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Globe
} from "lucide-react"

const features = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Clinical Trial Discovery",
    description: "Search and filter trials by location, disease type, phase, drug, and eligibility conditions. Find athlete-specific, age-specific, and condition-specific trials.",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Trial Map Explorer",
    description: "Interactive geographic map to discover clinical trials near you. Filter by distance and view trial locations worldwide.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Top 5 Recommendations",
    description: "AI-ranked trials based on your medical history compatibility. Each recommendation includes match percentage and key eligibility matches.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Smart Notifications",
    description: "Get alerts when new trials match your profile or when trial statuses change. Never miss an opportunity.",
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Criteria Matching",
    description: "Clear breakdown of which eligibility criteria you match and which you don't, with detailed explanations.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Long-Term Impact",
    description: "AI-predicted outcomes and potential long-term impacts of participating in specific trials or treatments.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Similar Trials",
    description: "Discover related trials you might have missed. Our AI suggests alternatives based on your profile.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Treatment Analysis",
    description: "Beyond trials — explore possible treatment procedures, medications, and alternative approaches for your condition.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-card/50 px-4 py-20 md:py-32">
      <div className="container mx-auto">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Powerful Features for Better Outcomes
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to find and evaluate clinical trials and treatment options.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="mx-auto mt-24 md:mt-28 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          <MetricCard value="10,000+" label="Clinical Trials" />
          <MetricCard value="95%" label="Match Accuracy" />
          <MetricCard value="50+" label="Countries Covered" />
          <MetricCard value="<5 min" label="Analysis Time" />
        </div>
      </div>
    </section>
  )
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-3xl font-bold text-primary md:text-4xl">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
