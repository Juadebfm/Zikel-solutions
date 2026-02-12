"use client"

import { User, UserCircle, Briefcase, Settings, Building2, Shield, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  label: string
  icon: React.ElementType
}

const steps: Step[] = [
  { id: 1, label: "Summary", icon: User },
  { id: 2, label: "Personal Details", icon: UserCircle },
  { id: 3, label: "Employment Details", icon: Briefcase },
  { id: 4, label: "User Details", icon: Settings },
  { id: 5, label: "Associations", icon: Building2 },
  { id: 6, label: "Permissions", icon: Shield },
]

interface CreateEmployeeStepperProps {
  currentStep: number
  onStepClick: (step: number) => void
  onNextClick: () => void
  onBackClick: () => void
  onSave: () => void
}

export function CreateEmployeeStepper({
  currentStep,
  onStepClick,
  onNextClick,
  onBackClick,
  onSave,
}: CreateEmployeeStepperProps) {
  return (
    <div className="flex items-center justify-between bg-blue-50/60 rounded-xl px-4 sm:px-8 py-4">
      {/* Back button */}
      {currentStep > 1 ? (
        <button
          onClick={onBackClick}
          className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-colors mr-4"
        >
          <ChevronLeft className="h-4 w-4" />
          back
        </button>
      ) : (
        <div className="w-0 sm:w-20" />
      )}

      <div className="flex items-center gap-1 sm:gap-4 flex-1">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center gap-1 sm:gap-4 flex-1 last:flex-none">
              <button
                onClick={() => onStepClick(step.id)}
                className="flex items-center gap-1.5 sm:gap-3 group"
              >
                <div
                  className={cn(
                    "h-8 w-8 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-6 sm:w-6" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">Step {step.id}</p>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded-full",
                    currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {currentStep < steps.length ? (
        <button
          onClick={onNextClick}
          className="ml-4 flex items-center gap-2 bg-primary text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onSave}
          className="ml-4 flex items-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
        >
          Save
        </button>
      )}
    </div>
  )
}
