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
  { id: 2, label: "Personal\nDetails", icon: UserCircle },
  { id: 3, label: "Employment\nDetails", icon: Briefcase },
  { id: 4, label: "User\nDetails", icon: Settings },
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
    <div className="flex items-center justify-between bg-blue-50/60 rounded-xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4 gap-2 sm:gap-0">
      {/* Back button */}
      {currentStep > 1 ? (
        <button
          onClick={onBackClick}
          className="flex items-center gap-1 sm:gap-1.5 border border-gray-300 text-gray-600 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-white transition-colors shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">back</span>
        </button>
      ) : (
        <div className="w-0 sm:w-16 shrink-0" />
      )}

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-1 min-w-0 mx-1 sm:mx-3">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-1 last:flex-none min-w-0">
              <button
                onClick={() => onStepClick(step.id)}
                className="flex items-center gap-1 sm:gap-2 group shrink-0"
              >
                <div
                  className={cn(
                    "h-7 w-7 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight whitespace-pre-line",
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
                    "flex-1 h-0.5 rounded-full min-w-2",
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
          className="flex items-center gap-1 sm:gap-2 bg-primary text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      ) : (
        <button
          onClick={onSave}
          className="flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm hover:bg-green-700 transition-colors shrink-0"
        >
          Save
        </button>
      )}
    </div>
  )
}
