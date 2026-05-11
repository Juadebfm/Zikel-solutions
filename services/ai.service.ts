import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Response Types ─────────────────────────────────────────────

export interface AskAiHighlight {
  title: string
  reason: string
  urgency: "low" | "medium" | "high" | "critical"
  action: string
}

export interface AskAiAction {
  label: string
  action: string
}

export interface AskAiResponseMeta {
  model: string | null
  page: string
  strengthProfile: "owner" | "admin" | "staff"
  responseMode: "comprehensive" | "balanced" | "focused"
  statsSource: "client" | "server" | "none"
  languageSafetyPassed: boolean
}

export interface AskAiResponse {
  message: string
  highlights: AskAiHighlight[]
  tip: string | null
  actions: AskAiAction[]
  source: "model" | "fallback"
  generatedAt: string
  meta: AskAiResponseMeta
}

// ─── Request Types ──────────────────────────────────────────────

export interface AskAiSummaryContext {
  stats?: {
    overdue?: number
    dueToday?: number
    pendingApproval?: number
    rejected?: number
    draft?: number
    future?: number
    comments?: number
    rewards?: number
  }
  todos?: Array<{
    title: string
    status?: string
    priority?: string
    dueDate?: string | null
  }>
  tasksToApprove?: Array<{
    title: string
    status?: string
    priority?: string
    dueDate?: string | null
  }>
}

export interface AskAiPageItem {
  id?: string
  title: string
  status?: string
  priority?: string
  category?: string
  type?: string
  dueDate?: string | null
  assignee?: string
  home?: string
  extra?: Record<string, string>
}

export interface AskAiPageContext {
  items?: AskAiPageItem[]
  filters?: Record<string, string>
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    totalPages?: number
  }
}

export type AskAiContext = AskAiSummaryContext | AskAiPageContext

export type AskAiPage =
  | "summary"
  | "tasks"
  | "daily_logs"
  | "care_groups"
  | "homes"
  | "young_people"
  | "employees"
  | "vehicles"
  | "form_designer"
  | "users"
  | "audit"

export interface AskAiPayload {
  query: string
  page?: AskAiPage
  displayMode?: "auto" | "standard" | "minimal"
  context?: AskAiContext
}

// ─── Conversational AI types ────────────────────────────────────

export type AiMessageRole = "user" | "assistant"

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  fallbackUsed?: boolean
  createdAt: string
}

export interface AiConversationSummary {
  id: string
  title: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AiConversation extends AiConversationSummary {
  messages: AiMessage[]
}

export interface SendMessageResponse {
  assistantMessage: AiMessage
}

export interface ListConversationsParams {
  page?: number
  pageSize?: number
  includeArchived?: boolean
}

export interface ListConversationsResult {
  data: AiConversationSummary[]
  meta: ApiMeta
}

// ─── Service ────────────────────────────────────────────────────

export const aiService = {
  async ask(payload: AskAiPayload): Promise<AskAiResponse> {
    const response = await apiRequest<AskAiResponse>({
      path: "/ai/ask",
      method: "POST",
      auth: true,
      body: payload,
    })

    return response.data
  },

  async createConversation(): Promise<AiConversation> {
    const response = await apiRequest<AiConversation>({
      path: "/ai/conversations",
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async listConversations(params: ListConversationsParams = {}): Promise<ListConversationsResult> {
    const response = await apiRequest<AiConversationSummary[]>({
      path: "/ai/conversations",
      auth: true,
      query: {
        page: params.page,
        pageSize: params.pageSize,
        includeArchived: params.includeArchived ? "true" : undefined,
      },
    })
    return {
      data: response.data,
      meta:
        (response.meta as ApiMeta) ?? {
          total: response.data.length,
          page: 1,
          pageSize: response.data.length,
          totalPages: 1,
        },
    }
  },

  async getConversation(id: string): Promise<AiConversation> {
    const response = await apiRequest<AiConversation>({
      path: `/ai/conversations/${id}`,
      auth: true,
    })
    return response.data
  },

  async sendMessage(id: string, content: string): Promise<SendMessageResponse> {
    const response = await apiRequest<SendMessageResponse>({
      path: `/ai/conversations/${id}/messages`,
      method: "POST",
      auth: true,
      body: { content },
    })
    return response.data
  },

  async patchConversation(
    id: string,
    payload: { title?: string | null; archived?: boolean },
  ): Promise<AiConversationSummary> {
    const response = await apiRequest<AiConversationSummary>({
      path: `/ai/conversations/${id}`,
      method: "PATCH",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async deleteConversation(id: string): Promise<void> {
    await apiRequest<{ deleted: true }>({
      path: `/ai/conversations/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}
