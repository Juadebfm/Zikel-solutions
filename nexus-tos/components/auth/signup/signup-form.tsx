"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { StepIndicator } from "@/components/auth/step-indicator"
import { StepCountry } from "./step-country"
import { StepBasicInfo } from "./step-basic-info"
import { StepPassword } from "./step-password"
import { StepVerification } from "./step-verification"
import { useFormSteps } from "@/hooks/use-form-steps"
import { authService } from "@/services/auth.service"
import type { SignupStepData, SupportedCountry, Gender } from "@/types"

const SIGNUP_STEPS = [
  { number: 1, title: "Country of residence" },
  { number: 2, title: "Basic information" },
  { number: 3, title: "Create password" },
  { number: 4, title: "Verify email" },
]

const initialData: SignupStepData = {
  step1: { country: null },
  step2: {
    firstName: "",
    middleName: "",
    surname: "",
    gender: null,
    email: "",
    phone: "",
    phoneCountryCode: "",
  },
  step3: {
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false,
  },
  step4: {
    verificationCode: "",
  },
}

interface SignupFormProps {
  onStepChange?: (step: number) => void
}

export function SignupForm({ onStepChange }: SignupFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    currentStep,
    data,
    setStepData,
    nextStep,
    prevStep,
  } = useFormSteps<SignupStepData>({
    totalSteps: 4,
    initialData,
    onStepChange: (step) => {
      onStepChange?.(step)
    },
  })

  // Step 1: Country selection
  const handleCountryNext = (country: SupportedCountry) => {
    setStepData("step1", { country })
    // Set default phone code based on country
    const phoneCode = country === "UK" ? "+44" : "+234"
    setStepData("step2", { ...data.step2, phoneCountryCode: phoneCode })
    nextStep()
  }

  // Step 2: Basic info
  const handleBasicInfoNext = (basicInfo: SignupStepData["step2"]) => {
    setStepData("step2", basicInfo)
    nextStep()
  }

  // Step 3: Password - submit to API and move to verification
  const handlePasswordNext = async (passwordData: SignupStepData["step3"]) => {
    setStepData("step3", passwordData)
    setError(null)

    // Prepare signup data
    const signupData = {
      country: data.step1.country!,
      firstName: data.step2.firstName,
      middleName: data.step2.middleName || undefined,
      surname: data.step2.surname,
      gender: data.step2.gender as Gender,
      email: data.step2.email,
      phone: data.step2.phone,
      phoneCountryCode: data.step2.phoneCountryCode,
      password: passwordData.password,
    }

    try {
      const result = await authService.signup(signupData)
      if (result.success) {
        nextStep()
      } else {
        setError(result.message || "Failed to create account. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    }
  }

  // Step 4: OTP verification
  const handleVerify = async (code: string): Promise<boolean> => {
    setError(null)
    try {
      const result = await authService.verifyOTP(data.step2.email, code)
      if (result.success) {
        // Redirect to login on success
        router.push("/login?verified=true")
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleResend = async () => {
    await authService.resendOTP(data.step2.email)
  }

  return (
    <div className="w-full">
      {/* Logo - Mobile */}
      <div className="flex justify-center mb-6 lg:hidden">
        <Image
          src="/favicon.png"
          alt="Zikel Solutions"
          width={48}
          height={48}
          className="rounded-xl"
          priority
        />
      </div>

      {/* Step Indicator */}
      <div className="max-w-md mx-auto mb-8">
        <StepIndicator steps={SIGNUP_STEPS} currentStep={currentStep} />
      </div>

      {/* Global Error */}
      {error && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* Step Content */}
      {currentStep === 1 && (
        <StepCountry
          value={data.step1.country}
          onNext={handleCountryNext}
        />
      )}

      {currentStep === 2 && data.step1.country && (
        <StepBasicInfo
          data={data.step2}
          country={data.step1.country}
          onNext={handleBasicInfoNext}
          onBack={prevStep}
        />
      )}

      {currentStep === 3 && (
        <StepPassword
          data={data.step3}
          onNext={handlePasswordNext}
          onBack={prevStep}
        />
      )}

      {currentStep === 4 && (
        <StepVerification
          email={data.step2.email}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={prevStep}
        />
      )}

      {/* Sign In Link */}
      <p className="text-center mt-6 text-gray-600">
        Got an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
