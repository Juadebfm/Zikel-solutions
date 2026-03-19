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

  async getProvisions(): Promise<HomeProvision[]> {
    const response = await apiRequest<HomeProvision[]>({
      path: "/summary/provisions",
      auth: true,
    })

    return response.data
  },
}

export default summaryService
