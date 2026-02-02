"use client"

import { useState, useCallback } from "react"
import { SignupForm } from "@/components/auth/signup/signup-form"

export default function RegisterPage() {
  // This state is used to trigger animation in the parent layout
  // We pass a callback to SignupForm that gets called on step change
  const [, setCurrentStep] = useState(1)

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step)
    // The animation is handled by the layout through pathname change detection
    // But for in-page step changes, we could add additional logic here
  }, [])

  return <SignupForm onStepChange={handleStepChange} />
}
