import { apiRequest } from "@/lib/api/client"

export interface AskAiSuggestion {
  label: string
  action: string
}

interface AskAiAnalysisBaseItem {
  id?: string
  title?: string
  label?: string
  name?: string
  summary?: string
  description?: string
}

export interface AskAiTopPriority extends AskAiAnalysisBaseItem {
  urgencyScore?: number
  recommendedAction?: string
  priority?: string
}

export interface AskAiRisk extends AskAiAnalysisBaseItem {
  severity?: string
  recommendedAction?: string
}

export interface AskAiMissingData extends AskAiAnalysisBaseItem {
  field?: string
  message?: string
}

export interface AskAiQuickAction {
  action: string
  label?: string
  title?: string
  description?: string
}

export interface AskAiAnalysis {
  strengthProfile?: "owner" | "admin" | "staff" | string
  responseMode?: "comprehensive" | "balanced" | "focused" | string
  contextSummary?: string
  topPriorities?: AskAiTopPriority[]
  risks?: AskAiRisk[]
  missingData?: AskAiMissingData[]
  quickActions?: AskAiQuickAction[]
  platformSnapshot?: Record<string, unknown> | null
}

/** Summary-page context (backward-compatible) */
export interface AskAiSummaryContext {
  stats?: Record<string, unknown>
  todos?: Array<Record<string, unknown>>
  tasksToApprove?: Array<Record<string, unknown>>
}

/** Generic page context (tasks, homes, employees, etc.) */
export interface AskAiPageContext {
  items?: Array<Record<string, unknown>>
  filters?: Record<string, unknown>
  meta?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
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
  context?: AskAiContext
}

export interface AskAiResponse {
  answer: string
  suggestions: AskAiSuggestion[]
  source: "model" | "fallback"
  model: string | null
  statsSource: "client" | "server" | "none"
  generatedAt: string
  analysis?: AskAiAnalysis
}

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
