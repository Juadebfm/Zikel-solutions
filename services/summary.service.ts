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

export interface SummaryTodoItem {
  id: string
  title: string
  relation: string
  status: string
  approvalStatus: string
  priority: string
  assignee: string
  dueDate: string
}

export interface SummaryTaskToApprove {
  id: string
  title: string
  relation: string
  status: string
  approvalStatus: string
  priority: string
  assignee: string
  dueDate: string
  reviewedByCurrentUser?: boolean
  reviewedAt?: string | null
}

export interface SummaryTaskToApproveDetail {
  id: string
  title: string
  relation: string
  status: string
  approvalStatus: string
  priority: string
  assignee: string
  dueDate: string
  reviewedByCurrentUser: boolean
  reviewedAt: string | null
  renderPayload: Record<string, unknown> | null
  labels: string[]
  meta: Record<string, unknown> | null
}

export interface ReviewEventPayload {
  action: "view_detail" | "review" | "acknowledge"
}

export interface ReviewEventResult {
  success: boolean
  reviewedAt: string | null
}

export interface BatchProcessPayload {
  taskIds: string[]
  action: "approve" | "reject"
  rejectionReason?: string
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

export interface OverdueTask {
  id: string
  taskRef: string
  title: string
  formGroup: string
  status: string
  relatesTo: string
  taskDate: string
}


export interface PaginatedResult<T> {
  items: T[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
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
  }): Promise<PaginatedResult<SummaryTodoItem>> {
    const response = await apiRequest<SummaryTodoItem[], ApiMeta>({
      path: "/summary/todos",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        search: params?.search,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getTasksToApprove(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<SummaryTaskToApprove>> {
    const response = await apiRequest<SummaryTaskToApprove[], ApiMeta>({
      path: "/summary/tasks-to-approve",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
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

  async approveTask(taskId: string, comment?: string): Promise<SummaryTaskToApprove> {
    const response = await apiRequest<SummaryTaskToApprove>({
      path: `/summary/tasks-to-approve/${taskId}/approve`,
      method: "POST",
      auth: true,
      body: {
        comment,
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
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        formGroup: params?.formGroup,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
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
