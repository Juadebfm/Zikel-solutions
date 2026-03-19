"use client"

import Image from "next/image"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { basicInfoSchema, type BasicInfoFormValues } from "@/lib/validators"
import { useLanguage } from "@/contexts/language-context"
import type { SupportedCountry, Gender } from "@/types"

// Flag CDN URL helper
const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`

interface BasicInfoData {
  firstName: string
  middleName: string
  surname: string
  gender: Gender | null
  email: string
  phone: string
  phoneCountryCode: string
}

interface StepBasicInfoProps {
  data: BasicInfoData
  country: SupportedCountry
  onNext: (data: BasicInfoData) => void
  onBack: () => void
}

const genderOptions = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
  { value: "other" as const, label: "Other" },
  { value: "prefer-not-to-say" as const, label: "Prefer not to say" },
]

const phoneCodes: Record<SupportedCountry, { code: string; flagCode: string }> = {
  UK: { code: "+44", flagCode: "gb" },
  Nigeria: { code: "+234", flagCode: "ng" },
}

export function StepBasicInfo({ data, country, onNext, onBack }: StepBasicInfoProps) {
  const { t } = useLanguage()
  const phoneCode = phoneCodes[country]

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: data.firstName || "",
      middleName: data.middleName || "",
      surname: data.surname || "",
      gender: data.gender || undefined,
      email: data.email || "",
      phone: data.phone || "",
      phoneCountryCode: data.phoneCountryCode || phoneCode.code,
    },
  })

  const onSubmit = (formData: BasicInfoFormValues) => {
    onNext({
      firstName: formData.firstName,
      middleName: formData.middleName || "",
      surname: formData.surname,
      gender: formData.gender,
      email: formData.email,
      phone: formData.phone,
      phoneCountryCode: formData.phoneCountryCode,
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
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

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.gender")}
                  </Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 mt-1.5 border-gray-200 rounded-lg">
                        <SelectValue placeholder={t("auth.signup.step2.genderPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="focus:bg-gray-100"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step2.phone")}
                  </Label>
                  <FormControl>
                    <div className="flex mt-1.5">
                      <div className="flex items-center gap-2 px-3 h-12 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50">
                        <span className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={getFlagUrl(phoneCode.flagCode)}
                            alt={country}
                            width={24}
                            height={18}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </span>
                        <span className="text-sm text-gray-600">
                          {phoneCode.code}
                        </span>
                      </div>
                      <Input
                        type="tel"
                        placeholder={t("auth.signup.step2.phonePlaceholder")}
                        className="h-12 border-gray-200 rounded-l-none rounded-r-lg flex-1"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden field for phone country code */}
            <input
              type="hidden"
              {...form.register("phoneCountryCode")}
              value={phoneCode.code}
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
