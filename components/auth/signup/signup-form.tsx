"use client"

import { useRef, useState } from "react"
import Link from "next/link"

import { StepIndicator, StepIndicatorCompact } from "@/components/auth/step-indicator"
import { StepCountry } from "./step-country"
import { StepBasicInfo } from "./step-basic-info"
import { StepPassword } from "./step-password"
import { StepVerification } from "./step-verification"
import { useFormSteps } from "@/hooks/use-form-steps"
import { useAuth } from "@/contexts/auth-context"
import { getOtpDeliveryStatusMessage, getPublicAuthErrorMessage } from "@/lib/auth/otp"
import { isApiClientError } from "@/lib/api/error"
import { logApiError } from "@/lib/api/logger"
import { authService, type OtpDeliveryStatus, type ResendOtpPayload } from "@/services/auth.service"
import type { SignupStepData, SupportedCountry } from "@/types"
import { AuthErrorDialog } from "@/components/auth/auth-error-dialog"

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
    organizationName: "",
    organizationSlug: "",
    email: "",
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
  const registerGuardRef = useRef(false)
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
    nextStep()
  }

  // Step 2: Basic info
  const handleBasicInfoNext = (basicInfo: SignupStepData["step2"]) => {
    setStepData("step2", basicInfo)
    nextStep()
  }

  // Step 3: Password - submit to API and move to verification
  const handlePasswordNext = async (passwordData: SignupStepData["step3"]) => {
    // Ref-based guard prevents duplicate submissions even if state hasn't flushed yet
    if (isRegistering || registerGuardRef.current) {
      return
    }

    setStepData("step3", passwordData)
    setError(null)

    const signupData = {
      country: data.step1.country!,
      firstName: data.step2.firstName,
      surname: data.step2.surname,
      email: data.step2.email,
      organizationName: data.step2.organizationName,
      organizationSlug: data.step2.organizationSlug || undefined,
      password: passwordData.password,
    }

    try {
      registerGuardRef.current = true
      setIsRegistering(true)
      const payload = await authService.register(signupData)
      setResendAvailableAt(payload.resendAvailableAt)
      setOtpDeliveryStatus(payload.otpDeliveryStatus)
      setOtpDeliveryMessage(getOtpDeliveryStatusMessage(payload.otpDeliveryStatus))
      nextStep()
    } catch (error) {
      logApiError(error, "register")
      setError(getRegisterErrorMessage(error))
    } finally {
      registerGuardRef.current = false
      setIsRegistering(false)
    }
  }

  // Step 4: OTP verification
  const handleVerify = async (code: string): Promise<{ success: boolean; message?: string }> => {
    setError(null)
    try {
      const payload = await authService.verifyOtp(data.step2.email, code)
      if (!payload.session?.activeTenantId) {
        return {
          success: false,
          message:
            "Your account was verified, but we could not activate your organization workspace. Please contact support.",
        }
      }
      await completeAuth(payload)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: getPublicAuthErrorMessage(error, "Invalid verification code. Please try again."),
      }
    }
  }

  const handleResend = async (): Promise<ResendOtpPayload> => {
    const payload = await authService.resendOtp(data.step2.email)
    setResendAvailableAt(payload.resendAvailableAt)
    setOtpDeliveryStatus(payload.otpDeliveryStatus)
    setOtpDeliveryMessage(getOtpDeliveryStatusMessage(payload.otpDeliveryStatus))
    return payload
  }

  return (
    <div className="w-full">
      <AuthErrorDialog
        open={Boolean(error)}
        message={error ?? ""}
        title="Sign up error"
        onOpenChange={(open) => {
          if (!open) {
            setError(null)
          }
        }}
      />

      {/* Step Indicator */}
      <div className="max-w-md mx-auto mb-8">
        <StepIndicator steps={SIGNUP_STEPS} currentStep={currentStep} className="hidden sm:flex" />
        <StepIndicatorCompact currentStep={currentStep} totalSteps={SIGNUP_STEPS.length} className="flex sm:hidden justify-center" />
      </div>

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

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN:
    "An account with this email already exists. Log in or reset password.",
  ORG_SLUG_TAKEN:
    "Organization name is already in use. Try another one.",
  REGISTRATION_CONFLICT:
    "This signup conflicts with an existing account/org. Please retry or use a different email/org name.",
}

function getRegisterErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    const mapped = REGISTER_ERROR_MESSAGES[error.code]
    if (mapped) return mapped

    // VALIDATION_ERROR: show the backend message directly
    if (
      error.code === "VALIDATION_ERROR" ||
      error.code === "FST_ERR_VALIDATION" ||
      error.code === "BAD_REQUEST"
    ) {
      return error.message || "Please check your input and try again."
    }
  }

  return getPublicAuthErrorMessage(error, "An error occurred. Please try again.")
}
