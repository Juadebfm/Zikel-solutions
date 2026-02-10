"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/header"
import { TaskExplorerStepper } from "@/components/task-explorer/task-explorer-stepper"
import { TaskExplorerConfig } from "@/components/task-explorer/task-explorer-config"
import { TaskExplorerForms } from "@/components/task-explorer/task-explorer-forms"
import { TaskExplorerLogs } from "@/components/task-explorer/task-explorer-logs"
import { ErrorBanner } from "@/components/shared/error-banner"
import { ValidationErrorModal } from "@/components/shared/validation-error-modal"
import { useTaskExplorerStore } from "@/stores/task-explorer-store"

export default function TasksPage() {
  const {
    currentStep,
    setCurrentStep,
    filters,
    updateFilter,
    errors,
    showErrorModal,
    setShowErrorModal,
    goToNextStep,
    goToPrevStep,
    validateStep,
  } = useTaskExplorerStore()

  const handleStepClick = (step: number) => {
    // Going forward requires validation; going backward is always allowed
    if (step > currentStep) {
      // Validate all steps up to current before advancing
      if (validateStep(currentStep)) {
        setCurrentStep(step)
      }
    } else {
      setCurrentStep(step)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Explorer"
        showNewTask={false}
        showAskAI={false}
      />

      <TaskExplorerStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
        onNextClick={goToNextStep}
        onBackClick={goToPrevStep}
      />

      {/* Inline error banner (matches screenshot) */}
      {errors.length > 0 && currentStep === 1 && (
        <ErrorBanner errors={errors} />
      )}

      <Card>
        <CardContent className="p-0">
          {currentStep === 1 && (
            <TaskExplorerConfig
              filters={filters}
              onFiltersChange={(key, value) => updateFilter(key, value)}
            />
          )}

          {currentStep === 2 && <TaskExplorerForms filters={filters} />}

          {currentStep === 3 && <TaskExplorerLogs filters={filters} />}
        </CardContent>
      </Card>

      <ValidationErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={errors}
      />
    </div>
  )
}
