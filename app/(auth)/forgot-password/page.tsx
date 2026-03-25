"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { getCooldownSecondsFromError, getPublicAuthErrorMessage } from "@/lib/auth/otp"
import { isApiClientError } from "@/lib/api/error"
import { authService } from "@/services/auth.service"

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (cooldownSeconds > 0) return
    setSubmitError(null)

    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSubmittedEmail(data.email.trim())
      setIsSubmitted(true)
    } catch (error) {
      if (isApiClientError(error) && (error.status === 429 || error.code === "RATE_LIMIT_EXCEEDED")) {
        const seconds = getCooldownSecondsFromError(error)
        setCooldownSeconds(seconds)
      }
      setSubmitError(getPublicAuthErrorMessage(error, "Failed to send reset instructions. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-600 mb-8">
              We&apos;ve sent password reset instructions to your email address.
            </p>
            <Link
              href={`/reset-password${submittedEmail ? `?email=${encodeURIComponent(submittedEmail)}` : ""}`}
              className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium mb-4"
            >
              I already have my code
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <p className="text-primary font-medium mb-1">Password Recovery</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            Enter your email address and we&apos;ll send you instructions to reset
            your password.
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {submitError}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        className="pl-10 h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={isLoading || cooldownSeconds > 0}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : cooldownSeconds > 0 ? (
                `Try again in ${cooldownSeconds}s`
              ) : (
                "Send Reset Instructions"
              )}
            </Button>

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
