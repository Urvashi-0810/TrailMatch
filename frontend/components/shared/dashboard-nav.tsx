"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Search,
  Map,
  Stethoscope,
  FileText,
  Home,
  Shield,
} from "lucide-react"

import { PulseIcon } from "@/components/ui/pulse-icon"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/upload", label: "Upload Records", icon: Upload },
  { href: "/trials", label: "Find Trials", icon: Search },
  { href: "/trials/map", label: "Trial Map", icon: Map },
  { href: "/treatments", label: "Treatments", icon: Stethoscope },
  { href: "/report", label: "Reports", icon: FileText },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-2 whitespace-nowrap",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PulseIcon className="h-4 w-4" />
            </div>
            <span className="font-semibold">TrialMatch AI</span>
          </Link>
        </div>
        <DashboardNav />
      </div>
    </header>
  )
}
