"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { AuthErrorDialog } from "@/components/auth/auth-error-dialog"
import { useAuth } from "@/contexts/auth-context"
import { getPublicAuthErrorMessage } from "@/lib/auth/otp"
import { LEGAL_URLS, isExternalUrl } from "@/lib/config/legal"
import { authService } from "@/services/auth.service"

const activateStaffSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit activation code sent to your email"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character")
      .regex(/^\S+$/, "Password must not contain spaces"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the Terms of Use and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ActivateStaffFormData = z.infer<typeof activateStaffSchema>

export default function ActivateStaffPage() {
  const searchParams = useSearchParams()
  const prefilledEmail = searchParams.get("email")?.trim() ?? ""
  const { completeAuth } = useAuth()
  const termsUrl = LEGAL_URLS.terms
  const privacyUrl = LEGAL_URLS.privacy

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ActivateStaffFormData>({
    resolver: zodResolver(activateStaffSchema),
    defaultValues: {
      email: prefilledEmail,
      code: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: ActivateStaffFormData) => {
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const payload = await authService.staffActivate({
        email: data.email,
        code: data.code,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      })
      await completeAuth(payload)
    } catch (error) {
      setSubmitError(getPublicAuthErrorMessage(error, "Unable to activate your account. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthErrorDialog
        open={Boolean(submitError)}
        message={submitError ?? ""}
        title="Activation failed"
        onOpenChange={(open) => {
          if (!open) {
            setSubmitError(null)
          }
        }}
      />

      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
        <div className="mb-8">
          <p className="text-primary font-medium mb-1">Staff Activation</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Activate Account
          </h1>
          <p className="text-gray-600">
            Enter your email, activation code, and set a password to continue.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activation code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit activation code"
                        className="pl-10 h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="h-12 pr-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        className="h-12 pr-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-3 pt-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="text-sm text-gray-600 leading-tight">
                      I accept the{" "}
                      {isExternalUrl(termsUrl) ? (
                        <a
                          href={termsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:text-primary/80"
                        >
                          Terms of Use
                        </a>
                      ) : (
                        <Link href={termsUrl} className="text-primary underline hover:text-primary/80">
                          Terms of Use
                        </Link>
                      )}{" "}
                      and{" "}
                      {isExternalUrl(privacyUrl) ? (
                        <a
                          href={privacyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:text-primary/80"
                        >
                          Privacy Policy
                        </a>
                      ) : (
                        <Link href={privacyUrl} className="text-primary underline hover:text-primary/80">
                          Privacy Policy
                        </Link>
                      )}
                      .
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Activate account"
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
