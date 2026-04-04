import { apiRequest } from "@/lib/api/client"

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
}
