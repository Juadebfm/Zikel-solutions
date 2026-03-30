"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { loginSchema, type LoginFormValues } from "@/lib/validators"
import { AuthErrorDialog } from "@/components/auth/auth-error-dialog"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const { login, isLoading } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    if (cooldownSeconds > 0) return
    setError(null)

    const result = await login(data.email, data.password)
    if (!result.success && result.requiresVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
      return
    }

    if (!result.success) {
      const message = result.message || "Invalid email or password. Please try again."
      if (message.toLowerCase().includes("too many") || message.toLowerCase().includes("rate")) {
        setCooldownSeconds(30)
      }
      setError(message)
    }
  }

  const isDisabled = isLoading || cooldownSeconds > 0

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthErrorDialog
        open={Boolean(error)}
        message={error ?? ""}
        onOpenChange={(open) => {
          if (!open) {
            setError(null)
          }
        }}
      />

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.login.title")}</h1>
          <p className="text-gray-500 mt-2">{t("auth.login.subtitle")}</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.login.email")}
                  </Label>
                  <FormControl>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder={t("auth.login.emailPlaceholder")}
                        className="pl-10 h-12 bg-white border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.login.password")}
                  </Label>
                  <FormControl>
                    <div className="relative mt-1.5">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.login.passwordPlaceholder")}
                        className="h-12 bg-white border-gray-200 rounded-lg focus:border-primary focus:ring-primary pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
              disabled={isDisabled}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : cooldownSeconds > 0 ? (
                `Try again in ${cooldownSeconds}s`
              ) : (
                t("auth.login.loginButton")
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Sign Up Link */}
      <p className="text-center mt-6 text-gray-600">
        {t("auth.login.noAccount")}{" "}
        <Link
          href="/register"
          className="text-primary hover:text-primary/80 font-medium"
        >
          {t("auth.login.signUp")}
        </Link>
      </p>
    </div>
  )
}
