"use client"

import { useState } from "react"
import Link from "next/link"

import { StepIndicator } from "@/components/auth/step-indicator"
import { StepCountry } from "./step-country"
import { StepBasicInfo } from "./step-basic-info"
import { StepPassword } from "./step-password"
import { StepVerification } from "./step-verification"
import { useFormSteps } from "@/hooks/use-form-steps"
import { BrandMark } from "@/components/shared/brand-mark"
import { useAuth } from "@/contexts/auth-context"
import { getOtpDeliveryStatusMessage, getPublicAuthErrorMessage } from "@/lib/auth/otp"
import { authService, type OtpDeliveryStatus, type ResendOtpPayload } from "@/services/auth.service"
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
  const { completeAuth } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [resendAvailableAt, setResendAvailableAt] = useState<string | null>(null)
  const [otpDeliveryStatus, setOtpDeliveryStatus] = useState<OtpDeliveryStatus | null>(null)
  const [otpDeliveryMessage, setOtpDeliveryMessage] = useState<string | null>(null)

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
  const handlePasswordNext = async (passwordData: SignupStepData["step3"], captchaToken?: string) => {
    if (isRegistering) {
      return
    }

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
      setIsRegistering(true)
      const payload = await authService.register(signupData, { captchaToken })
      setResendAvailableAt(payload.resendAvailableAt)
      setOtpDeliveryStatus(payload.otpDeliveryStatus)
      setOtpDeliveryMessage(getOtpDeliveryStatusMessage(payload.otpDeliveryStatus))
      nextStep()
    } catch (error) {
      setError(getPublicAuthErrorMessage(error, "An error occurred. Please try again."))
    } finally {
      setIsRegistering(false)
    }
  }

  // Step 4: OTP verification
  const handleVerify = async (code: string, captchaToken?: string): Promise<{ success: boolean; message?: string }> => {
    setError(null)
    try {
      const payload = await authService.verifyOtp(data.step2.email, code, { captchaToken })
      await completeAuth(payload)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: getPublicAuthErrorMessage(error, "Invalid verification code. Please try again."),
      }
    }
  }

  const handleResend = async (captchaToken?: string): Promise<ResendOtpPayload> => {
    const payload = await authService.resendOtp(data.step2.email, { captchaToken })
    setResendAvailableAt(payload.resendAvailableAt)
    setOtpDeliveryStatus(payload.otpDeliveryStatus)
    setOtpDeliveryMessage(getOtpDeliveryStatusMessage(payload.otpDeliveryStatus))
    return payload
  }

  return (
    <div className="w-full">
      {/* Logo - Mobile */}
      <div className="flex justify-center mb-6 lg:hidden">
        <BrandMark size={48} priority animated />
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
          isSubmitting={isRegistering}
        />
      )}

      {currentStep === 4 && (
        <StepVerification
          email={data.step2.email}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={prevStep}
          initialResendAvailableAt={resendAvailableAt}
          deliveryStatus={otpDeliveryStatus}
          deliveryMessage={otpDeliveryMessage}
        />
      )}

      {/* Sign In Link */}
      <p className="text-center mt-6 text-gray-600">
        Got an account?{" "}
        <Link
          href="/login"
          className={`text-primary font-medium ${
            isRegistering && currentStep === 3
              ? "pointer-events-none opacity-60"
              : "hover:text-primary/80"
          }`}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
