import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface SummaryStats {
  overdue: number
  dueToday: number
  pendingApproval: number
  rejected: number
  draft: number
  future: number
  comments: number
  rewards: number
}

export type SummaryTaskCategory =
  | "task_log"
  | "document"
  | "system_link"
  | "checklist"
  | "incident"
  | "other"

export type SummaryTaskWorkflowStatus = "pending" | "in_progress" | "completed" | "cancelled"

export type SummaryTaskApprovalStatus =
  | "not_required"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "processing"

export type SummaryTaskPriority = "low" | "medium" | "high" | "urgent"

export type SummaryTaskRelatedEntityType =
  | "young_person"
  | "home"
  | "vehicle"
  | "document"
  | "upload"
  | "care_group"
  | "tenant"
  | "employee"
  | "task"
  | "other"

export type SummaryTaskReferenceType =
  | "entity"
  | "upload"
  | "internal_route"
  | "external_url"
  | "document_url"

export type SummaryTaskReferenceEntityType =
  | "tenant"
  | "care_group"
  | "home"
  | "young_person"
  | "vehicle"
  | "employee"
  | "task"
  | null

export type SummaryTaskScope = "gate" | "popup" | "all"

export interface SummaryListLabels {
  listTitle: string
  taskRef: string
  title: string
  category: string
  workflowStatus: string
  approvalStatus: string
  priority: string
  dueAt: string
  assignee: string
  createdBy: string
  relatedEntity: string
}

export interface SummaryPreviewField {
  label: string
  value: string
  highlight?: boolean
}

export interface SummaryReferenceSummary {
  documents: number
  uploads: number
  links: number
  entities: number
  total: number
}

export interface SummaryTaskContext {
  formName?: string | null
  formGroup?: string | null
  homeOrSchool?: string | null
  relatedTo?: string | null
  taskDate?: string | null
  submittedBy?: string | null
  updatedBy?: string | null
  summary?: string | null
}

export interface SummaryTaskItem {
  id: string
  taskRef: string
  requestId?: string
  title: string
  description?: string

  domain?: string
  category: SummaryTaskCategory
  categoryLabel: string

  status: SummaryTaskWorkflowStatus
  statusLabel?: string
  approvalStatus: SummaryTaskApprovalStatus
  approvalStatusLabel?: string
  priority: SummaryTaskPriority

  submittedAt?: string | null
  dueAt: string | null

  assignee: { id: string; name: string; avatarUrl?: string | null } | null
  createdBy: { id: string; name: string; avatarUrl?: string | null } | null
  requestedBy?: string | null

  approvers?: Array<{ id: string; name: string; avatarUrl?: string | null }>

  relatedEntity: {
    type: SummaryTaskRelatedEntityType
    id: string | null
    name: string
    homeId: string | null
    careGroupId: string | null
  } | null

  previewFields?: SummaryPreviewField[]

  links: {
    taskUrl: string | null
    documentUrl: string | null
  }

  referenceSummary?: SummaryReferenceSummary
  context?: SummaryTaskContext | null

  review?: {
    reviewedByCurrentUser: boolean
    reviewedAt: string | null
    reviewedByCurrentUserName: string | null
  }

  timestamps: {
    createdAt: string
    updatedAt: string
  }

  references: Array<{
    id: string
    type: SummaryTaskReferenceType
    entityType: SummaryTaskReferenceEntityType
    entityId: string | null
    fileId: string | null
    url: string | null
    label: string | null
    metadata: unknown
  }>
}

export interface SummaryTaskToApproveDetail {
  id: string
  taskRef: string
  requestId?: string
  title: string
  description?: string

  domain?: string
  category: SummaryTaskCategory
  categoryLabel: string

  status: SummaryTaskWorkflowStatus
  statusLabel?: string
  approvalStatus: SummaryTaskApprovalStatus
  approvalStatusLabel?: string
  priority: SummaryTaskPriority

  submittedAt?: string | null
  dueAt: string | null

  assignee: { id: string; name: string; avatarUrl?: string | null } | null
  createdBy: { id: string; name: string; avatarUrl?: string | null } | null
  requestedBy?: string | null

  approvers?: Array<{ id: string; name: string; avatarUrl?: string | null }>

  relatedEntity: {
    type: SummaryTaskRelatedEntityType
    id: string | null
    name: string
    homeId: string | null
    careGroupId: string | null
  } | null

  previewFields?: SummaryPreviewField[]

  links: {
    taskUrl: string | null
    documentUrl: string | null
  }

  referenceSummary?: SummaryReferenceSummary
  context?: SummaryTaskContext | null

  review?: {
    reviewedByCurrentUser: boolean
    reviewedAt: string | null
    reviewedByCurrentUserName: string | null
  }

  timestamps: {
    createdAt: string
    updatedAt: string
  }

  references: Array<{
    id: string
    type: SummaryTaskReferenceType
    entityType: SummaryTaskReferenceEntityType
    entityId: string | null
    fileId: string | null
    url: string | null
    label: string | null
    metadata: unknown
  }>
  renderPayload: Record<string, unknown> | null
  labels?: string[]
  meta: Record<string, unknown> | null
}

export interface BatchArchivePayload {
  taskIds: string[]
}

export interface BatchArchiveResult {
  processed: number
  failed: Array<{ id: string; reason: string }>
}

export interface PostponeTaskPayload {
  dueDate: string
  reason?: string
}

export interface PostponeTaskResult {
  success: boolean
  task: SummaryTaskItem
}

export interface BatchPostponePayload {
  taskIds: string[]
  dueDate: string
  reason?: string
}

export interface BatchPostponeResult {
  processed: number
  failed: Array<{ id: string; reason: string }>
}

export interface BatchReassignPayload {
  taskIds: string[]
  assigneeId: string
  reason?: string
}

export interface BatchReassignResult {
  processed: number
  failed: Array<{ id: string; reason: string }>
}

export interface ReviewEventPayload {
  action: "view_detail" | "open_document" | "open_task" | "review" | "acknowledge"
}

export interface ReviewEventResult {
  success: boolean
  taskId?: string
  reviewedByCurrentUser?: boolean
  reviewedByCurrentUserName?: string | null
  reviewedAt: string | null
}

export interface BatchProcessPayload {
  taskIds: string[]
  action: "approve" | "reject"
  signatureFileId?: string
  rejectionReason?: string
  gateScope?: "global" | "task"
}

export interface BatchProcessResult {
  processed: number
  failed: Array<{ taskId: string; reason: string }>
}

export interface ProvisionEvent {
  id: string
  title: string
  time: string
  description: string | null
}

export interface ProvisionShift {
  employeeId: string
  employeeName: string
  startTime: string
  endTime: string
}

export interface HomeProvision {
  homeId: string
  homeName: string
  events: ProvisionEvent[]
  shifts: ProvisionShift[]
}

export interface OverdueTask extends SummaryTaskItem {
  formGroup?: string
  relatesTo?: string
  taskDate?: string
}


export interface PaginatedResult<T, L = undefined> {
  items: T[]
  meta: ApiMeta
  labels?: L
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

const SUMMARY_MAX_PAGE_SIZE = 500

const SUMMARY_LABEL_KEYS: Array<keyof SummaryListLabels> = [
  "listTitle",
  "taskRef",
  "title",
  "category",
  "workflowStatus",
  "approvalStatus",
  "priority",
  "dueAt",
  "assignee",
  "createdBy",
  "relatedEntity",
]

function clampPageSize(pageSize: number | undefined, fallback: number): number {
  const numericPageSize = typeof pageSize === "number" ? pageSize : Number.NaN
  if (!Number.isFinite(numericPageSize)) {
    return Math.min(fallback, SUMMARY_MAX_PAGE_SIZE)
  }

  const normalized = Math.floor(numericPageSize)
  if (normalized <= 0) {
    return Math.min(fallback, SUMMARY_MAX_PAGE_SIZE)
  }

  return Math.min(normalized, SUMMARY_MAX_PAGE_SIZE)
}

function extractSummaryLabels(response: unknown): SummaryListLabels | undefined {
  if (!response || typeof response !== "object") {
    return undefined
  }

  const labels = (response as { labels?: unknown }).labels
  if (!labels || typeof labels !== "object") {
    return undefined
  }

  const record = labels as Record<string, unknown>
  const hasAllKeys = SUMMARY_LABEL_KEYS.every((key) => typeof record[key] === "string")
  if (!hasAllKeys) {
    return undefined
  }

  return {
    listTitle: record.listTitle as string,
    taskRef: record.taskRef as string,
    title: record.title as string,
    category: record.category as string,
    workflowStatus: record.workflowStatus as string,
    approvalStatus: record.approvalStatus as string,
    priority: record.priority as string,
    dueAt: record.dueAt as string,
    assignee: record.assignee as string,
    createdBy: record.createdBy as string,
    relatedEntity: record.relatedEntity as string,
  }
}

export const summaryService = {
  async getStats(): Promise<SummaryStats> {
    const response = await apiRequest<SummaryStats>({
      path: "/summary/stats",
      auth: true,
    })

    return response.data
  },

  async getTodos(params?: {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
    search?: string
  }): Promise<PaginatedResult<SummaryTaskItem, SummaryListLabels>> {
    const response = await apiRequest<SummaryTaskItem[], ApiMeta>({
      path: "/summary/todos",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: clampPageSize(params?.pageSize, 20),
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        search: params?.search,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
      labels: extractSummaryLabels(response),
    }
  },

  async getTasksToApprove(params?: {
    page?: number
    pageSize?: number
    scope?: SummaryTaskScope
  }): Promise<PaginatedResult<SummaryTaskItem, SummaryListLabels>> {
    const response = await apiRequest<SummaryTaskItem[], ApiMeta>({
      path: "/summary/tasks-to-approve",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: clampPageSize(params?.pageSize, 20),
        scope: params?.scope,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
      labels: extractSummaryLabels(response),
    }
  },

  async getAllTasksToApprove(
    pageSize = SUMMARY_MAX_PAGE_SIZE,
    scope: SummaryTaskScope = "all"
  ): Promise<SummaryTaskItem[]> {
    const allRows: SummaryTaskItem[] = []
    const safePageSize = clampPageSize(pageSize, SUMMARY_MAX_PAGE_SIZE)
    let page = 1
    let totalPages = 1

    while (page <= totalPages) {
      const result = await summaryService.getTasksToApprove({ page, pageSize: safePageSize, scope })
      allRows.push(...result.items)

      const metaTotalPages = result.meta.totalPages
      if (Number.isFinite(metaTotalPages) && metaTotalPages > 0) {
        totalPages = metaTotalPages
      } else if (result.items.length < safePageSize) {
        break
      }

      page += 1
    }

    const deduped = new Map<string, SummaryTaskItem>()
    for (const row of allRows) {
      deduped.set(row.id, row)
    }

    return Array.from(deduped.values())
  },

  async processBatch(payload: BatchProcessPayload): Promise<BatchProcessResult> {
    const response = await apiRequest<BatchProcessResult>({
      path: "/summary/tasks-to-approve/process-batch",
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async approveTask(
    taskId: string,
    comment?: string,
    signatureFileId?: string,
    gateScope: "global" | "task" = "task"
  ): Promise<SummaryTaskItem> {
    const response = await apiRequest<SummaryTaskItem>({
      path: `/summary/tasks-to-approve/${taskId}/approve`,
      method: "POST",
      auth: true,
      body: {
        comment,
        signatureFileId,
        gateScope,
      },
    })

    return response.data
  },

  async getTaskToApproveDetail(taskId: string): Promise<SummaryTaskToApproveDetail> {
    const response = await apiRequest<SummaryTaskToApproveDetail>({
      path: `/summary/tasks-to-approve/${taskId}`,
      auth: true,
    })

    return response.data
  },

  async recordTaskReviewEvent(
    taskId: string,
    payload: ReviewEventPayload
  ): Promise<ReviewEventResult> {
    const response = await apiRequest<ReviewEventResult>({
      path: `/summary/tasks-to-approve/${taskId}/review-events`,
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async getOverdueTasks(params?: {
    page?: number
    pageSize?: number
    search?: string
    formGroup?: string
  }): Promise<PaginatedResult<OverdueTask>> {
    const response = await apiRequest<OverdueTask[], ApiMeta>({
      path: "/summary/overdue-tasks",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: clampPageSize(params?.pageSize, 20),
        search: params?.search,
        formGroup: params?.formGroup,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async batchArchive(payload: BatchArchivePayload): Promise<BatchArchiveResult> {
    const response = await apiRequest<BatchArchiveResult>({
      path: "/tasks/batch-archive",
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async postponeTask(taskId: string, payload: PostponeTaskPayload): Promise<PostponeTaskResult> {
    const response = await apiRequest<PostponeTaskResult>({
      path: `/tasks/${taskId}/postpone`,
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async batchPostpone(payload: BatchPostponePayload): Promise<BatchPostponeResult> {
    const response = await apiRequest<BatchPostponeResult>({
      path: "/tasks/batch-postpone",
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async batchReassign(payload: BatchReassignPayload): Promise<BatchReassignResult> {
    const response = await apiRequest<BatchReassignResult>({
      path: "/tasks/batch-reassign",
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async getProvisions(): Promise<HomeProvision[]> {
    const response = await apiRequest<HomeProvision[]>({
      path: "/summary/provisions",
      auth: true,
    })

    return response.data
  },
}

export default summaryService
