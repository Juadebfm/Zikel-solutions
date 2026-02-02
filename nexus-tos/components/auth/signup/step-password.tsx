"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { PasswordRequirements } from "@/components/auth/password-requirements"
import { passwordSchema, type PasswordFormValues } from "@/lib/validators"
import { useLanguage } from "@/contexts/language-context"

interface PasswordData {
  password: string
  confirmPassword: string
  acceptTerms: boolean
  acceptMarketing: boolean
}

interface StepPasswordProps {
  data: PasswordData
  onNext: (data: PasswordData) => void
  onBack: () => void
}

export function StepPassword({ data, onNext, onBack }: StepPasswordProps) {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: data.password || "",
      confirmPassword: data.confirmPassword || "",
      acceptTerms: data.acceptTerms || false,
      acceptMarketing: data.acceptMarketing || false,
    },
    mode: "onChange",
  })

  const password = form.watch("password")

  const onSubmit = (formData: PasswordFormValues) => {
    onNext({
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: formData.acceptTerms,
      acceptMarketing: formData.acceptMarketing || false,
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.signup.step3.heading")}</h1>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step3.password")}
                  </Label>
                  <FormControl>
                    <div className="relative mt-1.5">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.signup.step3.passwordPlaceholder")}
                        className="h-12 border-gray-200 rounded-lg pr-10"
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

            {/* Password Requirements */}
            <PasswordRequirements password={password} />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step3.confirmPassword")}
                  </Label>
                  <FormControl>
                    <div className="relative mt-1.5">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth.signup.step3.confirmPlaceholder")}
                        className="h-12 border-gray-200 rounded-lg pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            {/* Marketing Checkbox */}
            <FormField
              control={form.control}
              name="acceptMarketing"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <label className="text-sm text-gray-600 leading-tight cursor-pointer">
                    {t("auth.signup.step3.acceptMarketing")}
                  </label>
                </FormItem>
              )}
            />

            {/* Terms Checkbox */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="text-sm text-gray-600 leading-tight">
                    {t("auth.signup.step3.acceptTerms")}{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      {t("auth.signup.step3.termsOfUse")}
                    </Link>{" "}
                    {t("auth.signup.step3.and")}{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      {t("auth.signup.step3.privacyPolicy")}
                    </Link>
                    .
                  </div>
                </FormItem>
              )}
            />
            <FormMessage />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
            >
              {t("common.continue")}
            </Button>
          </form>
        </Form>
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-2 w-full max-w-md mx-auto mt-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">{t("common.back")}</span>
      </button>
    </div>
  )
}
