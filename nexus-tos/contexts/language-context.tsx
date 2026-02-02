"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { Language } from "@/types"
import en from "@/i18n/en.json"
import fr from "@/i18n/fr.json"

// Translation data type
type TranslationData = typeof en

// Nested key path type
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never
    }[keyof T]
  : never

type TranslationKey = NestedKeyOf<TranslationData>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const translations: Record<Language, TranslationData> = {
  en,
  fr,
}

const STORAGE_KEY = "nexus-language"

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(true)

  // Load language preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored && (stored === "en" || stored === "fr")) {
        setLanguageState(stored)
      }
    } catch {
      // localStorage not available
    }
    setIsLoading(false)
  }, [])

  // Update language and persist to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage not available
    }
  }, [])

  // Translation function
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".")
      let result: unknown = translations[language]

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = (result as Record<string, unknown>)[k]
        } else {
          // Key not found, return the key itself
          console.warn(`Translation key not found: ${key}`)
          return key
        }
      }

      if (typeof result === "string") {
        return result
      }

      console.warn(`Translation key "${key}" is not a string`)
      return key
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

/**
 * Hook for just getting the translation function
 * Useful when you don't need to change language
 */
export function useTranslation() {
  const { t, language } = useLanguage()
  return { t, language }
}
