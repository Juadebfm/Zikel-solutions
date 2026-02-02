import { z } from "zod"
import type { PasswordRequirement } from "@/types/auth"

// =============================================================================
// LOGIN VALIDATION
// =============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// =============================================================================
// SIGNUP VALIDATION - STEP 1: COUNTRY
// =============================================================================

export const countrySchema = z.object({
  country: z.enum(["UK", "Nigeria"], {
    message: "Please select a country",
  }),
})

export type CountryFormValues = z.infer<typeof countrySchema>

// =============================================================================
// SIGNUP VALIDATION - STEP 2: BASIC INFO
// =============================================================================

export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  middleName: z.string().max(50, "Middle name is too long").optional().or(z.literal("")),
  surname: z
    .string()
    .min(2, "Surname must be at least 2 characters")
    .max(50, "Surname is too long"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    message: "Please select a gender",
  }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  phoneCountryCode: z.string().min(1, "Country code is required"),
})

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>

// =============================================================================
// SIGNUP VALIDATION - STEP 3: PASSWORD
// =============================================================================

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Use and Privacy Policy",
    }),
    acceptMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type PasswordFormValues = z.infer<typeof passwordSchema>

// =============================================================================
// SIGNUP VALIDATION - STEP 4: OTP
// =============================================================================

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
})

export type OTPFormValues = z.infer<typeof otpSchema>

// =============================================================================
// FORGOT PASSWORD VALIDATION
// =============================================================================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// =============================================================================
// PASSWORD REQUIREMENTS FOR UI DISPLAY
// =============================================================================

export const passwordRequirements: PasswordRequirement[] = [
  {
    key: "lowercase",
    label: "A lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    key: "uppercase",
    label: "An uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    key: "number",
    label: "A number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    key: "special",
    label: "A special character",
    test: (password: string) => /[^a-zA-Z0-9]/.test(password),
  },
  {
    key: "minLength",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
  return passwordRequirements.every((req) => req.test(password))
}

/**
 * Get password strength percentage (0-100)
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  const metCount = passwordRequirements.filter((req) => req.test(password)).length
  return Math.round((metCount / passwordRequirements.length) * 100)
}
