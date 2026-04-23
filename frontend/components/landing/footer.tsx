import Link from "next/link"
import { PulseIcon } from "@/components/ui/pulse-icon"

const footerLinks = {
  Platform: [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Clinical Trials", href: "/trials" },
    { name: "Treatment Analysis", href: "/analyze" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "API Access", href: "#" },
    { name: "Research Partners", href: "#" },
    { name: "Case Studies", href: "#" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "HIPAA Compliance", href: "#" },
    { name: "Data Security", href: "#privacy" },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press Kit", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <PulseIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TrialMatch AI</span>
            </Link>
            <p className="mb-4 max-w-xs text-sm text-muted-foreground">
              AI-powered clinical trial matching platform. Find the right trials and treatments for your medical needs.
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} TrialMatch AI. All rights reserved.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-semibold text-foreground">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
