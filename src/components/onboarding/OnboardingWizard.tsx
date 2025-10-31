'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import WelcomeStep from './WelcomeStep'
import CourseNameStep from './CourseNameStep'
import UploadStep from './UploadStep'
import ReviewStep from './ReviewStep'
import ProgressBar from './ProgressBar'

const TOTAL_STEPS = 4

export default function OnboardingWizard() {
  const { onboardingStep, setOnboardingStep } = useStore()
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  const handleNext = () => {
    if (onboardingStep < TOTAL_STEPS) {
      setDirection(1)
      setOnboardingStep(onboardingStep + 1)
    }
  }

  const handleBack = () => {
    if (onboardingStep > 0) {
      setDirection(-1)
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.95
    })
  }

  const renderStep = () => {
    switch (onboardingStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} key="welcome" />
      case 1:
        return <CourseNameStep onNext={handleNext} onBack={handleBack} key="coursename" />
      case 2:
        return <UploadStep onNext={handleNext} onBack={handleBack} key="upload" />
      case 3:
        return <ReviewStep onNext={handleNext} onBack={handleBack} key="review" />
      default:
        return <WelcomeStep onNext={handleNext} key="welcome" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Progress bar - only show after welcome step */}
      {onboardingStep > 0 && onboardingStep < TOTAL_STEPS && (
        <ProgressBar currentStep={onboardingStep} totalSteps={TOTAL_STEPS} />
      )}

      {/* Step content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={onboardingStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
