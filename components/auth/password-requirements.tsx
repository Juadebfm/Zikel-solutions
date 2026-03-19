"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { passwordRequirements } from "@/lib/validators"

interface PasswordRequirementsProps {
  password: string
  className?: string
  showLabel?: boolean
}

export function PasswordRequirements({
  password,
  className,
  showLabel = true,
}: PasswordRequirementsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          AT LEAST:
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {passwordRequirements.map((req) => {
          const isMet = req.test(password)

          return (
            <div
              key={req.key}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                isMet
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              )}
            >
              {isMet && <Check className="w-3.5 h-3.5" />}
              <span>{req.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Compact version showing only status dots
 */
export function PasswordStrengthDots({
  password,
  className,
}: {
  password: string
  className?: string
}) {
  const metCount = passwordRequirements.filter((req) => req.test(password)).length
  const totalCount = passwordRequirements.length

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: totalCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            index < metCount ? "bg-green-500" : "bg-gray-300"
          )}
        />
      ))}
    </div>
  )
}
