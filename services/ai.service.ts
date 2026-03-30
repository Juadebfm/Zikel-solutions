import { apiRequest } from "@/lib/api/client"

export interface AskAiSuggestion {
  label: string
  action: string
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
