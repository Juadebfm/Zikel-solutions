"use client"

import { AlertCircle } from "lucide-react"

interface ValidationError {
  field: string
  message: string
}

interface ErrorBannerProps {
  errors: ValidationError[]
  title?: string
  className?: string
}

export function ErrorBanner({
  errors,
  title = "Errors",
  className,
}: ErrorBannerProps) {
  if (errors.length === 0) return null

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 ${className || ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-base font-semibold text-red-700">{title}</h3>
      </div>
      <ul className="space-y-1.5 ml-7">
        {errors.map((error, index) => (
          <li
            key={`${error.field}-${index}`}
            className="text-sm text-red-600 list-disc"
          >
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
