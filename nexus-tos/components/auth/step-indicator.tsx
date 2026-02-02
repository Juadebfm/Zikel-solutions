"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isCurrent = step.number === currentStep
        const isLast = index === steps.length - 1

        return (
          <div
            key={step.number}
            className={cn(
              "flex items-center",
              isCurrent ? "flex-shrink-0" : "flex-1 last:flex-none"
            )}
          >
            {/* Step Circle + Title */}
            <div className={cn(
              "flex items-center gap-3 flex-shrink-0",
              isCurrent && "min-w-[180px]"
            )}>
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 flex-shrink-0",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-primary text-white ring-4 ring-primary/20 shadow-md",
                  !isCompleted && !isCurrent && "bg-gray-100 text-gray-400 border-2 border-gray-200"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-3" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Title - Only show for current step */}
              {isCurrent && (
                <div className="hidden sm:block flex-shrink-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Step {step.number}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{step.title}</p>
                </div>
              )}
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-1 mx-3 rounded-full transition-colors duration-200 min-w-[20px]",
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Compact step indicator for mobile or constrained spaces
 */
export function StepIndicatorCompact({
  currentStep,
  totalSteps,
  className,
}: {
  currentStep: number
  totalSteps: number
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              isCurrent ? "w-8 bg-primary" : "w-4",
              isCompleted && "bg-green-500",
              !isCompleted && !isCurrent && "bg-gray-300"
            )}
          />
        )
      })}
    </div>
  )
}
