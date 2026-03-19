import { apiRequest } from "@/lib/api/client"

/**
 * Valid values for the serviceOfInterest field on public forms.
 * Backend enforces `additionalProperties: false` — deprecated values return 422.
 */
export const SERVICE_OF_INTEREST = [
  "care_documentation_platform",
  "ai_staff_guidance",
  "training_development",
  "healthcare_workflow",
  "general_enquiry",
] as const

export type ServiceOfInterest = (typeof SERVICE_OF_INTEREST)[number]

export interface BookDemoInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  organisationName?: string
  serviceOfInterest: ServiceOfInterest
  message?: string
}

export interface JoinWaitlistInput {
  firstName: string
  lastName: string
  email: string
  serviceOfInterest: ServiceOfInterest
}

export interface ContactUsInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  serviceOfInterest: ServiceOfInterest
  message: string
}

export interface PublicFormResponse {
  message: string
}

export const publicService = {
  async bookDemo(input: BookDemoInput): Promise<PublicFormResponse> {
    const response = await apiRequest<PublicFormResponse>({
      path: "/public/book-demo",
      method: "POST",
      body: input,
    })
    return response.data
  },

  async joinWaitlist(input: JoinWaitlistInput): Promise<PublicFormResponse> {
    const response = await apiRequest<PublicFormResponse>({
      path: "/public/join-waitlist",
      method: "POST",
      body: input,
    })
    return response.data
  },

  async contactUs(input: ContactUsInput): Promise<PublicFormResponse> {
    const response = await apiRequest<PublicFormResponse>({
      path: "/public/contact-us",
      method: "POST",
      body: input,
    })
    return response.data
  },
}

export default publicService
