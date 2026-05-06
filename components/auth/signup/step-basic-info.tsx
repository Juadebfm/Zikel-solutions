"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"

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
import { basicInfoSchema, type BasicInfoFormValues } from "@/lib/validators"
import { useLanguage } from "@/contexts/language-context"

interface BasicInfoData {
  firstName: string
  middleName: string
  surname: string
  organizationName: string
  organizationSlug: string
  email: string
}

interface StepBasicInfoProps {
  data: BasicInfoData
  onNext: (data: BasicInfoData) => void
  onBack: () => void
}

export function StepBasicInfo({ data, onNext, onBack }: StepBasicInfoProps) {
  const { t } = useLanguage()

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: data.firstName || "",
      middleName: data.middleName || "",
      surname: data.surname || "",
      organizationName: data.organizationName || "",
      organizationSlug: data.organizationSlug || "",
      email: data.email || "",
    },
  })

  const onSubmit = (formData: BasicInfoFormValues) => {
    onNext({
      firstName: formData.firstName,
      middleName: formData.middleName || "",
      surname: formData.surname,
      organizationName: formData.organizationName.trim(),
      organizationSlug: formData.organizationSlug?.trim().toLowerCase() || "",
      email: formData.email,
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.signup.step2.heading")}</h1>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.firstName")}
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.step2.firstNamePlaceholder")}
                      className="h-12 mt-1.5 border-gray-200 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Middle Name */}
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.middleName")}
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.step2.middleNamePlaceholder")}
                      className="h-12 mt-1.5 border-gray-200 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Surname */}
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.surname")}
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.step2.surnamePlaceholder")}
                      className="h-12 mt-1.5 border-gray-200 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Name */}
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.organizationName")}
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.step2.organizationNamePlaceholder")}
                      className="h-12 mt-1.5 border-gray-200 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Slug */}
            <FormField
              control={form.control}
              name="organizationSlug"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.organizationSlug")}
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("auth.signup.step2.organizationSlugPlaceholder")}
                      className="h-12 mt-1.5 border-gray-200 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.email")}
                  </Label>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("auth.signup.step2.emailPlaceholder")}
                      className="h-12 mt-1.5 border-gray-200 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg mt-6"
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
