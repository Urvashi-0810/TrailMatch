"use client"

import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { SecurityBanner } from "@/components/landing/security-banner"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { PrivacySection } from "@/components/landing/privacy-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <SecurityBanner />
      <FeaturesSection />
      <HowItWorks />
      <PrivacySection />
      <CTASection />
      <Footer />
    </>
  )
}
