"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"

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
import { getPublicAuthErrorMessage } from "@/lib/auth/otp"
import { LEGAL_URLS, isExternalUrl } from "@/lib/config/legal"
import {
  authService,
  type JoinInviteDetailsPayload,
} from "@/services/auth.service"

const joinInviteSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name is too long"),
    lastName: z.string().min(2, "Surname must be at least 2 characters").max(50, "Surname is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
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

type JoinInviteFormData = z.infer<typeof joinInviteSchema>

const ROLE_LABELS: Record<JoinInviteDetailsPayload["defaultRole"], string> = {
  staff: "Staff",
  sub_admin: "Sub Admin",
  tenant_admin: "Tenant Admin",
}

export default function JoinByInvitePage() {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const inviteCode = typeof params?.code === "string" ? params.code : ""
  const termsUrl = LEGAL_URLS.terms
  const privacyUrl = LEGAL_URLS.privacy

  const [inviteDetails, setInviteDetails] = useState<JoinInviteDetailsPayload | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isInviteLoading, setIsInviteLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<JoinInviteFormData>({
    resolver: zodResolver(joinInviteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  useEffect(() => {
    let isMounted = true

    const loadInvite = async () => {
      if (!inviteCode) {
        setInviteError("This invitation link is invalid.")
        setIsInviteLoading(false)
        return
      }

      setIsInviteLoading(true)
      setInviteError(null)

      try {
        const payload = await authService.validateJoinInvite(inviteCode)
        if (!isMounted) return
        setInviteDetails(payload)
      } catch (error) {
        if (!isMounted) return
        setInviteError(getPublicAuthErrorMessage(error, "This invitation link is invalid or expired."))
      } finally {
        if (isMounted) {
          setIsInviteLoading(false)
        }
      }
    }

    void loadInvite()

    return () => {
      isMounted = false
    }
  }, [inviteCode])

  const roleLabel = useMemo(() => {
    if (!inviteDetails) {
      return "Staff"
    }

    return ROLE_LABELS[inviteDetails.defaultRole] ?? "Staff"
  }, [inviteDetails])

  const onSubmit = async (data: JoinInviteFormData) => {
    if (!inviteCode) {
      setSubmitError("This invitation link is invalid.")
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await authService.joinViaInvite(inviteCode, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      })

      router.push(`/verify-email?email=${encodeURIComponent(data.email.trim())}`)
    } catch (error) {
      setSubmitError(getPublicAuthErrorMessage(error, "Unable to submit your registration. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isInviteLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-14">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-gray-500">Validating invite link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (inviteError || !inviteDetails) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invite link unavailable</h1>
          <p className="text-gray-600 mt-3">
            {inviteError ?? "This invitation link is no longer available."}
          </p>
          <div className="mt-6">
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthErrorDialog
        open={Boolean(submitError)}
        message={submitError ?? ""}
        title="Unable to complete invitation"
        onOpenChange={(open) => {
          if (!open) {
            setSubmitError(null)
          }
        }}
      />

      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
        <div className="mb-8">
          <p className="text-primary font-medium mb-1">Join Organization</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join {inviteDetails.tenantName}
          </h1>
          <p className="text-gray-600">
            You are invited to join as <span className="font-medium text-gray-700">{roleLabel}</span>.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      className="h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surname</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your surname"
                      className="h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="h-12 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                      {...field}
                    />
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
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Join organization
                </span>
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
