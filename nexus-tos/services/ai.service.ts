import { apiRequest } from "@/lib/api/client"

export interface AskAiSuggestion {
  label: string
  action: string
}

export interface AskAiContext {
  stats?: Record<string, unknown>
  todos?: Array<Record<string, unknown>>
  tasksToApprove?: Array<Record<string, unknown>>
}

export interface AskAiPayload {
  query: string
  page?: string
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
