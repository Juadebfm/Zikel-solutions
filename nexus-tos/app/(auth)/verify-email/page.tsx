"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { StepVerification } from "@/components/auth/signup/step-verification"
import { BrandMark } from "@/components/shared/brand-mark"
import { useAuth } from "@/contexts/auth-context"
import { authService, type ResendOtpPayload } from "@/services/auth.service"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { completeAuth } = useAuth()

  const email = searchParams.get("email")?.trim() ?? ""

  const handleVerify = async (code: string): Promise<boolean> => {
    if (!email) {
      return false
    }

    try {
      const payload = await authService.verifyOtp(email, code)
      await completeAuth(payload)
      return true
    } catch {
      return false
    }
  }

  const handleResend = async (): Promise<ResendOtpPayload> => {
    return authService.resendOtp(email)
  }

  if (!email) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-8 lg:hidden">
          <BrandMark size={48} priority animated />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verification link is incomplete</h1>
          <p className="text-gray-500 mt-3">
            We need your email address to verify your account.
          </p>
          <div className="mt-6">
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
              Return to signup
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StepVerification
      email={email}
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={() => router.push("/login")}
    />
  )
}
