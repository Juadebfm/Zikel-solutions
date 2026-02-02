"use client"

import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
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
import { countrySchema, type CountryFormValues } from "@/lib/validators"
import type { SupportedCountry } from "@/types"

interface StepCountryProps {
  value: SupportedCountry | null
  onNext: (country: SupportedCountry) => void
}

// Flag CDN URL helper
const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`

const countries = [
  { code: "UK" as const, name: "United Kingdom", flagCode: "gb" },
  { code: "Nigeria" as const, name: "Nigeria", flagCode: "ng" },
]

export function StepCountry({ value, onNext }: StepCountryProps) {
  const { t } = useLanguage()
  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      country: value || undefined,
    },
  })

  const onSubmit = (data: CountryFormValues) => {
    onNext(data.country)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.signup.step1.question")}
          </h1>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Country Select */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("auth.signup.step1.countryLabel")}
                  </Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-12 py-3.5 mt-1.5 border-gray-200 rounded-lg">
                        <SelectValue placeholder={t("auth.signup.step1.countryPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem
                          key={country.code}
                          value={country.code}
                          className="focus:bg-gray-100"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={getFlagUrl(country.flagCode)}
                                alt={country.name}
                                width={24}
                                height={18}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
    </div>
  )
}
