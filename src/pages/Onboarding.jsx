import React, { useState } from 'react';
import SegmentStep from '../components/onboarding/SegmentStep';
import CompanyStep from '../components/onboarding/CompanyStep';
import IntegrationStep from '../components/onboarding/IntegrationStep';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [onboardingData, setOnboardingData] = useState({
    segment: '',
    otherSpecification: '',
    fullName: '',
    taxId: '',
    taxIdType: 'cnpj',
    birthDate: '',
    companyName: '',
    phone: '',
    botName: ''
  });

  const changeStep = (newStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveStep(newStep);
      setStep(newStep);
      setIsAnimating(false);
    }, 200);
  };

  const nextStep = () => changeStep(Math.min(step + 1, 3));
  const prevStep = () => changeStep(Math.max(step - 1, 1));

  const updateData = (fields) => {
    setOnboardingData((prev) => ({ ...prev, ...fields }));
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 font-sans antialiased text-[#111111]">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto border-b border-gray-100 pb-6 flex items-center justify-between">
        <img src="/banner.png" alt="Zelt.AI" className="h-10 w-auto object-contain" />
      </div>

      {/* Steps */}
      <div className={`my-auto transition-all duration-200 transform ${
        isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}>
        {activeStep === 1 && (
          <SegmentStep data={onboardingData} updateData={updateData} onNext={nextStep} />
        )}
        {activeStep === 2 && (
          <CompanyStep data={onboardingData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />
        )}
        {activeStep === 3 && (
          <IntegrationStep data={onboardingData} updateData={updateData} onComplete={() => window.location.href = '/dashboard'} onPrev={prevStep} />
        )}
      </div>

      {/* Footer */}
      <div className="w-full text-center text-sm text-gray-400 font-medium pt-6">
        Precisa de ajuda? <a href="#" className="text-[#6300ff] hover:underline">Fale com o suporte</a>
      </div>
    </div>
  );
}
