"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCreateEmployeeStore } from "@/stores/create-employee-store"
import { ValidationErrorModal } from "@/components/shared/validation-error-modal"
import { StepSummary } from "@/components/employees/create/step-summary"
import { StepPersonalDetails } from "@/components/employees/create/step-personal-details"
import { StepEmploymentDetails } from "@/components/employees/create/step-employment-details"
import { StepUserDetails } from "@/components/employees/create/step-user-details"
import { StepAssociations } from "@/components/employees/create/step-associations"
import { StepPermissions } from "@/components/employees/create/step-permissions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 6

const stepTitles: Record<number, string> = {
  1: "Summary",
  2: "Personal Details",
  3: "Employment Details",
  4: "User Details",
  5: "Associations",
  6: "Permissions",
}

interface CreateEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEmployeeDialog({ open, onOpenChange }: CreateEmployeeDialogProps) {
  const {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPrevStep,
    validateStep,
    errors,
    showErrorModal,
    setShowErrorModal,
    resetForm,
  } = useCreateEmployeeStore()

  const handleSave = () => {
    if (validateStep(currentStep)) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:!max-w-[60rem] max-h-[90vh] flex flex-col p-0 gap-0 sm:w-[calc(100%-4rem)]">
          {/* Header with step indicator */}
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Create Employee</DialogTitle>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Step {currentStep} of {TOTAL_STEPS}: {stepTitles[currentStep]}
            </p>

            {/* Step dots */}
            <div className="flex items-center gap-2 mt-4">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    if (step < currentStep) setCurrentStep(step)
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    step === currentStep
                      ? "w-8 bg-primary"
                      : step < currentStep
                        ? "w-2 bg-green-500 cursor-pointer hover:bg-green-600"
                        : "w-2 bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Step Content — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
            {currentStep === 1 && <StepSummary />}
            {currentStep === 2 && <StepPersonalDetails />}
            {currentStep === 3 && <StepEmploymentDetails />}
            {currentStep === 4 && <StepUserDetails />}
            {currentStep === 5 && <StepAssociations />}
            {currentStep === 6 && <StepPermissions />}
          </div>

          {/* Footer with navigation */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={goToPrevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <span className="text-xs text-gray-400">
              {currentStep} / {TOTAL_STEPS}
            </span>

            {currentStep < TOTAL_STEPS ? (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={goToNextStep}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 gap-1.5"
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation Error Modal */}
      <ValidationErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={errors}
      />
    </>
  )
}
