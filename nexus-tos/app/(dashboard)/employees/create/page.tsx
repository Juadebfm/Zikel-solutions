"use client"

import { useRouter } from "next/navigation"
import { useCreateEmployeeStore } from "@/stores/create-employee-store"
import { CreateEmployeeStepper } from "@/components/employees/create-employee-stepper"
import { ValidationErrorModal } from "@/components/shared/validation-error-modal"
import { StepSummary } from "@/components/employees/create/step-summary"
import { StepPersonalDetails } from "@/components/employees/create/step-personal-details"
import { StepEmploymentDetails } from "@/components/employees/create/step-employment-details"
import { StepUserDetails } from "@/components/employees/create/step-user-details"
import { StepAssociations } from "@/components/employees/create/step-associations"
import { StepPermissions } from "@/components/employees/create/step-permissions"

const stepTitles: Record<number, string> = {
  1: "Summary",
  2: "Personal Details",
  3: "Employment Details",
  4: "User Details",
  5: "Associations",
  6: "Permissions",
}

export default function CreateEmployeePage() {
  const router = useRouter()
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

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    } else if (step === currentStep + 1) {
      goToNextStep()
    }
  }

  const handleSave = () => {
    if (validateStep(currentStep)) {
      resetForm()
      router.push("/employees")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Employee</h1>
        <p className="text-gray-500 mt-1">
          Add a new employee record to the system.
        </p>
      </div>

      {/* Stepper */}
      <CreateEmployeeStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
        onNextClick={goToNextStep}
        onBackClick={goToPrevStep}
        onSave={handleSave}
      />

      {/* Step Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {stepTitles[currentStep]}
        </h2>

        {currentStep === 1 && <StepSummary />}
        {currentStep === 2 && <StepPersonalDetails />}
        {currentStep === 3 && <StepEmploymentDetails />}
        {currentStep === 4 && <StepUserDetails />}
        {currentStep === 5 && <StepAssociations />}
        {currentStep === 6 && <StepPermissions />}
      </div>

      {/* Validation Error Modal */}
      <ValidationErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={errors}
      />
    </div>
  )
}
