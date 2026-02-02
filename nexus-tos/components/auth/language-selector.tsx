"use client"

import Image from "next/image"
import { ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Language } from "@/types"

interface LanguageOption {
  code: Language
  label: string
  countryCode: string // ISO 2-letter country code for flag
}

const languages: LanguageOption[] = [
  { code: "en", label: "English", countryCode: "gb" },
  { code: "fr", label: "Français", countryCode: "fr" },
]

// Flag CDN URL helper
const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`

interface LanguageSelectorProps {
  className?: string
  variant?: "default" | "ghost" | "outline"
}

export function LanguageSelector({
  className,
  variant = "outline",
}: LanguageSelectorProps) {
  const { language, setLanguage, isLoading } = useLanguage()

  const currentLanguage = languages.find((l) => l.code === language) || languages[0]

  if (isLoading) {
    return (
      <Button
        variant={variant}
        className={cn("gap-2 min-w-[140px]", className)}
        disabled
      >
        <Globe className="h-4 w-4" />
        <span>...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            "gap-2 min-w-[140px] justify-between font-normal",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <Image
              src={getFlagUrl(currentLanguage.countryCode)}
              alt={currentLanguage.label}
              width={20}
              height={20}
              className="rounded-full object-cover"
              unoptimized
            />
            <span>{currentLanguage.label}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => setLanguage(lang.code)}
            className={cn(
              "cursor-pointer gap-2",
              language === lang.code && "bg-accent"
            )}
          >
            <Image
              src={getFlagUrl(lang.countryCode)}
              alt={lang.label}
              width={20}
              height={20}
              className="rounded-full object-cover"
              unoptimized
            />
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
