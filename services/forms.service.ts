import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Enums / Unions ───────────────────────────────────────────────

export type FormStatus = "draft" | "published" | "archived"

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "datetime"
  | "checkbox"
  | "radio"
  | "file"
  | "signature"
  | "section_header"
  | "divider"

export type FormTriggerType =
  | "manual"
  | "scheduled"
  | "event_driven"
  | "on_admission"
  | "on_discharge"

// ─── List Item ────────────────────────────────────────────────────

export interface FormListItem {
  id: string
  slug: string
  title: string
  description?: string
  category: string
  categoryLabel: string
  status: FormStatus
  statusLabel: string
  version: number
  entityTypes: string[]
  submissionCount: number
  createdBy: { id: string; name: string } | null
  timestamps: {
    createdAt: string
    updatedAt: string
    publishedAt?: string | null
  }
}

// ─── Detail ───────────────────────────────────────────────────────

export interface FormFieldOption {
  value: string
  label: string
}

export interface FormBuilderField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: FormFieldOption[]
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  defaultValue?: unknown
  order: number
  sectionId?: string
}

export interface FormBuilderSection {
  id: string
  title: string
  description?: string
  order: number
  collapsible?: boolean
}

export interface FormBuilderSchema {
  sections: FormBuilderSection[]
  fields: FormBuilderField[]
}

export interface FormAccessRules {
  confidentiality: "open" | "restricted" | "confidential"
  allowedRoles?: string[]
  approverIds?: string[]
  requireSignature: boolean
  requireApproval: boolean
}

export interface FormTriggerRules {
  type: FormTriggerType
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
    dayOfWeek?: number
    dayOfMonth?: number
    time?: string
  }
  event?: {
    entityType: string
    eventName: string
  }
  autoAssign: boolean
  defaultAssigneeId?: string
  defaultDueInDays?: number
}

export interface FormDetail extends FormListItem {
  access: FormAccessRules
  builder: FormBuilderSchema
  trigger: FormTriggerRules
}

// ─── Metadata ─────────────────────────────────────────────────────

export interface FormMetadata {
  fieldTypes: Array<{
    type: FormFieldType
    label: string
    icon: string
    description: string
    supportsOptions: boolean
    supportsValidation: boolean
  }>
  categories: Array<{
    value: string
    label: string
  }>
  entityTypes: Array<{
    value: string
    label: string
  }>
  confidentialityLevels: Array<{
    value: string
    label: string
    description: string
  }>
  triggerTypes: Array<{
    value: FormTriggerType
    label: string
    description: string
  }>
}

// ─── Create / Update ──────────────────────────────────────────────

export interface CreateFormPayload {
  title: string
  description?: string
  category: string
  entityTypes?: string[]
}

export interface UpdateFormPayload {
  title?: string
  description?: string
  category?: string
  entityTypes?: string[]
}

// ─── Submission ───────────────────────────────────────────────────

export interface FormSubmissionPayload {
  assigneeId?: string
  dueAt?: string
  approverIds?: string[]
  payload: Record<string, unknown>
  relatedEntityId?: string
  relatedEntityType?: string
  signatureFileId?: string
  attachmentFileIds?: string[]
}

export interface FormSubmissionResult {
  id: string
  taskId: string
  taskRef: string
  status: string
}

// ─── Preview ──────────────────────────────────────────────────────

export interface FormPreviewResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
  renderedSections: number
  renderedFields: number
}

// ─── Query Params ─────────────────────────────────────────────────

export interface FormListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: FormStatus
  category?: string
}

// ─── Paginated Result ─────────────────────────────────────────────

export interface PaginatedForms {
  items: FormListItem[]
  meta: ApiMeta
}

// ─── Service ──────────────────────────────────────────────────────

export const formsService = {
  async list(params?: FormListParams): Promise<PaginatedForms> {
    const response = await apiRequest<FormListItem[], ApiMeta>({
      path: "/forms",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        status: params?.status,
        category: params?.category,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 },
    }
  },

  async getDetail(formId: string): Promise<FormDetail> {
    const response = await apiRequest<FormDetail>({
      path: `/forms/${formId}`,
      auth: true,
    })
    return response.data
  },

  async getMetadata(): Promise<FormMetadata> {
    const response = await apiRequest<FormMetadata>({
      path: "/forms/metadata",
      auth: true,
    })
    return response.data
  },

  async create(payload: CreateFormPayload): Promise<FormListItem> {
    const response = await apiRequest<FormListItem>({
      path: "/forms",
      method: "POST",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async update(formId: string, payload: UpdateFormPayload): Promise<FormListItem> {
    const response = await apiRequest<FormListItem>({
      path: `/forms/${formId}`,
      method: "PATCH",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async updateAccess(formId: string, access: FormAccessRules): Promise<void> {
    await apiRequest<unknown>({
      path: `/forms/${formId}/access`,
      method: "PATCH",
      auth: true,
      body: access,
    })
  },

  async updateBuilder(formId: string, builder: FormBuilderSchema): Promise<void> {
    await apiRequest<unknown>({
      path: `/forms/${formId}/builder`,
      method: "PATCH",
      auth: true,
      body: builder,
    })
  },

  async updateTrigger(formId: string, trigger: FormTriggerRules): Promise<void> {
    await apiRequest<unknown>({
      path: `/forms/${formId}/trigger`,
      method: "PATCH",
      auth: true,
      body: trigger,
    })
  },

  async preview(formId: string): Promise<FormPreviewResult> {
    const response = await apiRequest<FormPreviewResult>({
      path: `/forms/${formId}/preview`,
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async publish(formId: string): Promise<FormListItem> {
    const response = await apiRequest<FormListItem>({
      path: `/forms/${formId}/publish`,
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async archive(formId: string): Promise<FormListItem> {
    const response = await apiRequest<FormListItem>({
      path: `/forms/${formId}/archive`,
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async clone(formId: string): Promise<FormListItem> {
    const response = await apiRequest<FormListItem>({
      path: `/forms/${formId}/clone`,
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async submit(formId: string, payload: FormSubmissionPayload): Promise<FormSubmissionResult> {
    const response = await apiRequest<FormSubmissionResult>({
      path: `/forms/${formId}/submissions`,
      method: "POST",
      auth: true,
      body: payload,
    })
    return response.data
  },
}
