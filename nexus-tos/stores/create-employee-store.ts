import { create } from "zustand"

interface ValidationError {
  field: string
  message: string
}

// ─── Step 1: Summary ───────────────────────────────────────────────────────
interface SummaryData {
  employeeName: string
  nexusStartDate: string
  nexusEndDate: string
  administrator: string
  profileImage: File | null
  colour: string
  careGroupJoiningDate: string
  careGroupLeavingDate: string
  extraDetails: string
}

// ─── Step 2: Personal Details ──────────────────────────────────────────────
interface PersonalDetailsData {
  nationality: string
  ethnicity: string
  gender: string
  residesAtCareHome: "yes" | "no" | ""
  nextOfKin: string
  nationalInsuranceNumber: string
}

// ─── Step 3: Employment Details ────────────────────────────────────────────
interface EmploymentDetailsData {
  jobTitle: string
  employmentType: string
  currentGrading: string
  weeklyContractingHours: string
  lineManager: string
  onProbation: "yes" | "no" | ""
  inCareRole: "yes" | "no" | ""
  yearsOfExperience: string
  monthsOfExperience: string
  contractType: string
  annualLeaveFlexibility: string
}

// ─── Step 4: User Details ──────────────────────────────────────────────────
interface UserDetailsData {
  setCorrespondingUserRecord: boolean
}

// ─── Step 5: Associations ──────────────────────────────────────────────────
interface AssociationsData {
  homeSchool: string
  admissionDate: string
  leavingDate: string
}

// ─── Step 6: Permissions ───────────────────────────────────────────────────
export interface PermissionUser {
  id: string
  name: string
  email: string
  accessLevel: "none" | "read-only" | "read-write"
}

interface PermissionsData {
  showInactiveUsers: boolean
  users: PermissionUser[]
}

// ─── Full Store ────────────────────────────────────────────────────────────

interface CreateEmployeeState {
  currentStep: number
  setCurrentStep: (step: number) => void

  // Step data
  summary: SummaryData
  personalDetails: PersonalDetailsData
  employmentDetails: EmploymentDetailsData
  userDetails: UserDetailsData
  associations: AssociationsData
  permissions: PermissionsData

  // Updaters
  updateSummary: <K extends keyof SummaryData>(key: K, value: SummaryData[K]) => void
  updatePersonalDetails: <K extends keyof PersonalDetailsData>(key: K, value: PersonalDetailsData[K]) => void
  updateEmploymentDetails: <K extends keyof EmploymentDetailsData>(key: K, value: EmploymentDetailsData[K]) => void
  updateUserDetails: <K extends keyof UserDetailsData>(key: K, value: UserDetailsData[K]) => void
  updateAssociations: <K extends keyof AssociationsData>(key: K, value: AssociationsData[K]) => void
  updatePermissionUser: (userId: string, accessLevel: PermissionUser["accessLevel"]) => void
  setShowInactiveUsers: (show: boolean) => void

  // Validation
  errors: ValidationError[]
  showErrorModal: boolean
  setShowErrorModal: (show: boolean) => void
  validateStep: (step: number) => boolean
  clearErrors: () => void

  // Navigation
  goToNextStep: () => void
  goToPrevStep: () => void

  // Reset
  resetForm: () => void
}

const initialSummary: SummaryData = {
  employeeName: "",
  nexusStartDate: "",
  nexusEndDate: "",
  administrator: "",
  profileImage: null,
  colour: "",
  careGroupJoiningDate: "",
  careGroupLeavingDate: "",
  extraDetails: "",
}

const initialPersonalDetails: PersonalDetailsData = {
  nationality: "",
  ethnicity: "",
  gender: "",
  residesAtCareHome: "",
  nextOfKin: "",
  nationalInsuranceNumber: "",
}

const initialEmploymentDetails: EmploymentDetailsData = {
  jobTitle: "",
  employmentType: "",
  currentGrading: "",
  weeklyContractingHours: "",
  lineManager: "",
  onProbation: "",
  inCareRole: "",
  yearsOfExperience: "",
  monthsOfExperience: "",
  contractType: "",
  annualLeaveFlexibility: "",
}

const initialUserDetails: UserDetailsData = {
  setCorrespondingUserRecord: false,
}

const initialAssociations: AssociationsData = {
  homeSchool: "",
  admissionDate: "",
  leavingDate: "",
}

const initialPermissions: PermissionsData = {
  showInactiveUsers: false,
  users: [
    { id: "u1", name: "Sarah Johnson", email: "sarah.johnson@nexustherapeutic.com", accessLevel: "none" },
    { id: "u2", name: "Mark Thompson", email: "mark.thompson@nexustherapeutic.com", accessLevel: "none" },
    { id: "u3", name: "Emma White", email: "emma.white@nexustherapeutic.com", accessLevel: "none" },
    { id: "u4", name: "David Chen", email: "david.chen@nexustherapeutic.com", accessLevel: "none" },
    { id: "u5", name: "Lisa Patel", email: "lisa.patel@nexustherapeutic.com", accessLevel: "none" },
    { id: "u6", name: "James Wilson", email: "james.wilson@nexustherapeutic.com", accessLevel: "none" },
    { id: "u7", name: "Rachel Green", email: "rachel.green@nexustherapeutic.com", accessLevel: "none" },
    { id: "u8", name: "Tom Baker", email: "tom.baker@nexustherapeutic.com", accessLevel: "none" },
    { id: "u9", name: "Anna Scott", email: "anna.scott@nexustherapeutic.com", accessLevel: "none" },
    { id: "u10", name: "Peter Brown", email: "peter.brown@nexustherapeutic.com", accessLevel: "none" },
    { id: "u11", name: "Karen Williams", email: "karen.williams@nexustherapeutic.com", accessLevel: "none" },
    { id: "u12", name: "Michael Davis", email: "michael.davis@nexustherapeutic.com", accessLevel: "none" },
    { id: "u13", name: "Sophie Turner", email: "sophie.turner@nexustherapeutic.com", accessLevel: "none" },
    { id: "u14", name: "Robert Taylor", email: "robert.taylor@nexustherapeutic.com", accessLevel: "none" },
    { id: "u15", name: "Helen Moore", email: "helen.moore@nexustherapeutic.com", accessLevel: "none" },
    { id: "u16", name: "Chris Evans", email: "chris.evans@nexustherapeutic.com", accessLevel: "none" },
    { id: "u17", name: "Lucy Harris", email: "lucy.harris@nexustherapeutic.com", accessLevel: "none" },
  ],
}

function validateStepOne(data: SummaryData): ValidationError[] {
  const errors: ValidationError[] = []
  if (!data.employeeName.trim()) {
    errors.push({ field: "employeeName", message: "Employee Name is required" })
  }
  if (!data.nexusStartDate) {
    errors.push({ field: "nexusStartDate", message: "Nexus Start Date is required" })
  }
  if (!data.administrator) {
    errors.push({ field: "administrator", message: "Administrator is required" })
  }
  return errors
}

function validateStepTwo(data: PersonalDetailsData): ValidationError[] {
  const errors: ValidationError[] = []
  if (!data.gender) {
    errors.push({ field: "gender", message: "Gender is required" })
  }
  if (!data.residesAtCareHome) {
    errors.push({ field: "residesAtCareHome", message: "Resides At Care Home is required" })
  }
  return errors
}

function validateStepThree(data: EmploymentDetailsData): ValidationError[] {
  const errors: ValidationError[] = []
  if (!data.onProbation) {
    errors.push({ field: "onProbation", message: "On Probation is required" })
  }
  if (!data.inCareRole) {
    errors.push({ field: "inCareRole", message: "In Care Role is required" })
  }
  return errors
}

export const useCreateEmployeeStore = create<CreateEmployeeState>((set, get) => ({
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  // Step data
  summary: initialSummary,
  personalDetails: initialPersonalDetails,
  employmentDetails: initialEmploymentDetails,
  userDetails: initialUserDetails,
  associations: initialAssociations,
  permissions: initialPermissions,

  // Updaters
  updateSummary: (key, value) =>
    set((state) => ({
      summary: { ...state.summary, [key]: value },
      errors: state.errors.filter((e) => e.field !== key),
    })),

  updatePersonalDetails: (key, value) =>
    set((state) => ({
      personalDetails: { ...state.personalDetails, [key]: value },
      errors: state.errors.filter((e) => e.field !== key),
    })),

  updateEmploymentDetails: (key, value) =>
    set((state) => ({
      employmentDetails: { ...state.employmentDetails, [key]: value },
      errors: state.errors.filter((e) => e.field !== key),
    })),

  updateUserDetails: (key, value) =>
    set((state) => ({
      userDetails: { ...state.userDetails, [key]: value },
    })),

  updateAssociations: (key, value) =>
    set((state) => ({
      associations: { ...state.associations, [key]: value },
    })),

  updatePermissionUser: (userId, accessLevel) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        users: state.permissions.users.map((u) =>
          u.id === userId ? { ...u, accessLevel } : u
        ),
      },
    })),

  setShowInactiveUsers: (show) =>
    set((state) => ({
      permissions: { ...state.permissions, showInactiveUsers: show },
    })),

  // Validation
  errors: [],
  showErrorModal: false,
  setShowErrorModal: (show) => set({ showErrorModal: show }),
  clearErrors: () => set({ errors: [], showErrorModal: false }),

  validateStep: (step) => {
    let errors: ValidationError[] = []

    if (step === 1) errors = validateStepOne(get().summary)
    if (step === 2) errors = validateStepTwo(get().personalDetails)
    if (step === 3) errors = validateStepThree(get().employmentDetails)
    // Steps 4, 5, 6 have no required validation

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
      set({ currentStep: Math.min(currentStep + 1, 6) })
    }
  },

  goToPrevStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
      errors: [],
      showErrorModal: false,
    }))
  },

  // Reset
  resetForm: () =>
    set({
      currentStep: 1,
      summary: initialSummary,
      personalDetails: initialPersonalDetails,
      employmentDetails: initialEmploymentDetails,
      userDetails: initialUserDetails,
      associations: initialAssociations,
      permissions: initialPermissions,
      errors: [],
      showErrorModal: false,
    }),
}))
