import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Search } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-20 md:py-32">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Ready to Find Your Match?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Start your journey to finding the right clinical trial or treatment option. 
            Upload your medical records and get AI-powered insights in minutes.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href="/analyze">
                <FileText className="h-4 w-4" />
                Start Matching
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/analyze">
                <Search className="h-4 w-4" />
                Explore Trials
              </Link>
            </Button> */}
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            No account required. Your data is processed securely and never stored.
          </p>
        </div>
      </div>
    </section>
  )
}
