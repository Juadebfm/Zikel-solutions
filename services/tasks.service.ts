import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Enums / Unions ───────────────────────────────────────────────

export type TaskStatus =
  | "draft"
  | "submitted"
  | "sent_for_approval"
  | "approved"
  | "rejected"
  | "sent_for_deletion"
  | "deleted"
  | "deleted_draft"
  | "hidden"

export type TaskApprovalStatus =
  | "not_required"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "processing"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type TaskEntityType =
  | "home"
  | "young_person"
  | "vehicle"
  | "employee"
  | "document"
  | "event"

export type TaskScope = "all" | "my_tasks" | "assigned_to_me" | "approvals"

export type TaskActionType =
  | "submit"
  | "approve"
  | "reject"
  | "reassign"
  | "request_deletion"
  | "comment"

// ─── List Item ────────────────────────────────────────────────────

export interface TaskListItem {
  id: string
  taskRef: string
  title: string
  description?: string
  category: string
  categoryLabel: string
  type?: TaskEntityType
  typeLabel?: string
  status: TaskStatus
  statusLabel: string
  approvalStatus?: TaskApprovalStatus
  approvalStatusLabel?: string
  priority: TaskPriority
  dueAt: string | null
  submittedAt?: string | null
  relatedEntity: {
    type: TaskEntityType
    id: string | null
    name: string
  } | null
  assignee: { id: string; name: string; avatarUrl?: string | null } | null
  createdBy: { id: string; name: string; avatarUrl?: string | null } | null
  approvers?: Array<{ id: string; name: string; avatarUrl?: string | null }>
  formGroup?: string
  domain?: string
  links: {
    taskUrl: string | null
    documentUrl: string | null
  }
  referenceSummary?: {
    documents: number
    uploads: number
    links: number
    total: number
  }
  timestamps: {
    createdAt: string
    updatedAt: string
  }
}

// ─── Detail ───────────────────────────────────────────────────────

export interface TaskAttachment {
  id: string
  name: string
  contentType: string
  sizeBytes: number
}

export interface TaskApprovalChainEntry {
  userId: string
  name: string
  avatarUrl?: string | null
  status: "pending" | "approved" | "rejected"
  respondedAt: string | null
  comment?: string | null
}

export interface TaskActivityEntry {
  id: string
  action: string
  by: string
  at: string
  note: string | null
}

export interface TaskComment {
  id: string
  by: { name: string; avatarUrl?: string | null }
  text: string
  at: string
}

export interface TaskDetail extends TaskListItem {
  attachments: TaskAttachment[]
  approvalChain: TaskApprovalChainEntry[]
  activityLog: TaskActivityEntry[]
  comments: TaskComment[]
  formData?: Record<string, unknown> | null
  auditTrail?: Array<{
    field: string
    from: string
    to: string
    by: string
    at: string
  }>
}

// ─── Category / Template ──────────────────────────────────────────

export interface TaskCategory {
  value: string
  label: string
  types: TaskEntityType[] | null
}

export interface TaskFormTemplate {
  slug: string
  label: string
  category: string
}

// ─── Create / Update ──────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string
  description?: string
  category: string
  type?: TaskEntityType
  relatedEntityId?: string
  priority: TaskPriority
  dueAt?: string
  assigneeId?: string
  approverIds?: string[]
  formGroup?: string
  attachmentFileIds?: string[]
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  category?: string
  type?: TaskEntityType
  relatedEntityId?: string
  priority?: TaskPriority
  dueAt?: string
  assigneeId?: string
  approverIds?: string[]
  formGroup?: string
  attachmentFileIds?: string[]
}

// ─── Actions ──────────────────────────────────────────────────────

export interface TaskActionPayload {
  action: TaskActionType
  comment?: string
  reason?: string
  assigneeId?: string
  text?: string
}

export interface TaskActionResult {
  success: boolean
  task: TaskListItem
}

// ─── Query Params ─────────────────────────────────────────────────

export interface TaskListParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  status?: string
  type?: string
  category?: string
  entityId?: string
  assigneeId?: string
  createdById?: string
  period?: string
  dateFrom?: string
  dateTo?: string
  scope?: TaskScope
  formGroup?: string
}

// ─── Paginated Result ─────────────────────────────────────────────

export interface PaginatedTasks {
  items: TaskListItem[]
  meta: ApiMeta
}

// ─── Service ──────────────────────────────────────────────────────

export const tasksService = {
  async list(params?: TaskListParams): Promise<PaginatedTasks> {
    const response = await apiRequest<TaskListItem[], ApiMeta>({
      path: "/tasks",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        search: params?.search,
        status: params?.status,
        type: params?.type,
        category: params?.category,
        entityId: params?.entityId,
        assigneeId: params?.assigneeId,
        createdById: params?.createdById,
        period: params?.period,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        scope: params?.scope,
        formGroup: params?.formGroup,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 },
    }
  },

  async getDetail(taskId: string): Promise<TaskDetail> {
    const response = await apiRequest<TaskDetail>({
      path: `/tasks/${taskId}`,
      auth: true,
    })
    return response.data
  },

  async create(payload: CreateTaskPayload): Promise<TaskListItem> {
    const response = await apiRequest<TaskListItem>({
      path: "/tasks",
      method: "POST",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async update(taskId: string, payload: UpdateTaskPayload): Promise<TaskListItem> {
    const response = await apiRequest<TaskListItem>({
      path: `/tasks/${taskId}`,
      method: "PATCH",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async remove(taskId: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/tasks/${taskId}`,
      method: "DELETE",
      auth: true,
    })
  },

  async performAction(taskId: string, payload: TaskActionPayload): Promise<TaskActionResult> {
    const response = await apiRequest<TaskActionResult>({
      path: `/tasks/${taskId}/actions`,
      method: "POST",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async getCategories(): Promise<TaskCategory[]> {
    const response = await apiRequest<TaskCategory[]>({
      path: "/tasks/categories",
      auth: true,
    })
    return response.data
  },

  async getFormTemplates(): Promise<TaskFormTemplate[]> {
    const response = await apiRequest<TaskFormTemplate[]>({
      path: "/tasks/form-templates",
      auth: true,
    })
    return response.data
  },
}
