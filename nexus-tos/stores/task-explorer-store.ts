import { create } from "zustand"
import type { TaskExplorerFilters, TaskExplorerPeriod, TaskExplorerType, TaskExplorerStatusOption } from "@/types"

interface ValidationError {
  field: string
  message: string
}

interface TaskExplorerState {
  // Stepper
  currentStep: number
  setCurrentStep: (step: number) => void

  // Filters
  filters: TaskExplorerFilters
  updateFilter: <K extends keyof TaskExplorerFilters>(key: K, value: TaskExplorerFilters[K]) => void
  resetFilters: () => void

  // Validation
  errors: ValidationError[]
  showErrorModal: boolean
  setShowErrorModal: (show: boolean) => void
  validateStep: (step: number) => boolean
  clearErrors: () => void

  // Navigation
  goToNextStep: () => void
  goToPrevStep: () => void
}

const initialFilters: TaskExplorerFilters = {
  period: "",
  type: "",
  project: "",
  forms: [],
  field: "",
  keyword: "",
  searchByOther: [],
  taskId: "",
  statuses: [],
  showAuditTrail: false,
}

function validateStepOne(filters: TaskExplorerFilters): ValidationError[] {
  const errors: ValidationError[] = []

  if (!filters.period) {
    errors.push({ field: "period", message: "Please select a period" })
  }

  // When period is "custom", require start/end dates (future-proof)
  if (filters.period === "custom") {
    errors.push({ field: "startDate", message: "Please select a start date" })
    errors.push({ field: "endDate", message: "Please select an end date" })
  }

  return errors
}

export const useTaskExplorerStore = create<TaskExplorerState>((set, get) => ({
  // Stepper
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  // Filters
  filters: initialFilters,
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      // Clear errors for the field being updated
      errors: state.errors.filter((e) => e.field !== key),
    })),
  resetFilters: () => set({ filters: initialFilters, errors: [], currentStep: 1 }),

  // Validation
  errors: [],
  showErrorModal: false,
  setShowErrorModal: (show) => set({ showErrorModal: show }),
  clearErrors: () => set({ errors: [], showErrorModal: false }),

  validateStep: (step) => {
    let errors: ValidationError[] = []

    if (step === 1) {
      errors = validateStepOne(get().filters)
    }
    // Steps 2 and 3 have no required validation currently

    if (errors.length > 0) {
      set({ errors, showErrorModal: true })
      return false
    }

    set({ errors: [], showErrorModal: false })
    return true
  },

  // Navigation
  goToNextStep: () => {
    const { currentStep, validateStep } = get()
    if (validateStep(currentStep)) {
      set({ currentStep: Math.min(currentStep + 1, 3) })
    }
  },

  goToPrevStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
      errors: [],
      showErrorModal: false,
    }))
  },
}))
