import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import AutomationSection from '../components/AutomationSection'
import Resources from '../components/Resources'
import PricingAndFaq from '../components/Pricing'
import FooterSection from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-y-auto
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-white
      [&::-webkit-scrollbar-track]:border-l
      [&::-webkit-scrollbar-track]:border-gray-200
      [&::-webkit-scrollbar-thumb]:bg-[#111]
      [&::-webkit-scrollbar-thumb]:rounded-full"
    >
      <Header />
      <Hero />
      <AutomationSection />
      <Resources />
      <PricingAndFaq />
      <FooterSection />
    </div>
  )
}
