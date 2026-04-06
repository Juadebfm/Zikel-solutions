import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Chronology ─────────────────────────────────────────────────

export interface ChronologyEvent {
  id: string
  eventType: string
  severity: string
  source: string
  title: string
  narrative?: string | null
  occurredAt: string
  reportedAt?: string | null
  confidentialityScope?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  relatedEntityName?: string | null
  metadata?: Record<string, unknown> | null
}

export interface ChronologyQueryParams {
  dateFrom?: string
  dateTo?: string
  eventType?: string
  severity?: string
  source?: string
  confidentialityScope?: string
  maxEvents?: number
  includeNarrative?: boolean
}

export interface ChronologyResult {
  items: ChronologyEvent[]
  meta: ApiMeta
}

// ─── Risk Alerts ────────────────────────────────────────────────

export interface RiskAlertRule {
  id: string
  name: string
  description?: string | null
  severity: string
  type: string
  enabled: boolean
  conditions?: Record<string, unknown> | null
}

export interface RiskAlertNote {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface RiskAlert {
  id: string
  title: string
  severity: string
  status: string
  type: string
  targetType?: string | null
  targetId?: string | null
  targetName?: string | null
  ownerUserId?: string | null
  ownerName?: string | null
  description?: string | null
  createdAt: string
  acknowledgedAt?: string | null
  resolvedAt?: string | null
  notes?: RiskAlertNote[]
  metadata?: Record<string, unknown> | null
}

export interface RiskAlertQueryParams {
  status?: string
  severity?: string
  type?: string
  targetType?: string
  targetId?: string
  ownerUserId?: string
  includeNotes?: boolean
  confidentialityScope?: string
  page?: number
  pageSize?: number
}

export interface RiskAlertListResult {
  items: RiskAlert[]
  meta: ApiMeta
}

// ─── Pattern Mapping ────────────────────────────────────────────

export interface PatternIncident {
  id: string
  title: string
  eventType: string
  severity: string
  occurredAt: string
  relatedEntityName?: string | null
}

export interface PatternGroup {
  type: "frequency" | "cluster" | "recurrence" | "coOccurrence"
  label: string
  description?: string | null
  incidents: string[] // incident ids
  score?: number | null
  metadata?: Record<string, unknown> | null
}

export interface PatternInsight {
  id: string
  summary: string
  confidence: number
  relatedPatterns: string[] // pattern group labels
}

export interface PatternResult {
  incidents: PatternIncident[]
  patterns: PatternGroup[]
  insights: PatternInsight[]
}

export interface PatternQueryParams {
  dateFrom?: string
  dateTo?: string
  confidentialityScope?: string
  maxIncidents?: number
  minOccurrences?: number
  confidenceThreshold?: number
  maxPatterns?: number
}

// ─── Reflective Prompts ─────────────────────────────────────────

export interface ReflectivePrompt {
  id: string
  category: string
  prompt: string
  order: number
  helpText?: string | null
}

export interface ReflectivePromptSet {
  prompts: ReflectivePrompt[]
  responses: ReflectivePromptResponse[]
}

export interface ReflectivePromptResponse {
  promptId: string
  response: string
}

// ─── Default meta ───────────────────────────────────────────────

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const safeguardingService = {
  // ── Chronology ──────────────────────────────────────────────

  async getYoungPersonChronology(
    youngPersonId: string,
    params?: ChronologyQueryParams
  ): Promise<ChronologyResult> {
    const response = await apiRequest<ChronologyEvent[], ApiMeta>({
      path: `/safeguarding/chronology/young-people/${youngPersonId}`,
      auth: true,
      query: {
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        eventType: params?.eventType,
        severity: params?.severity,
        source: params?.source,
        confidentialityScope: params?.confidentialityScope,
        maxEvents: params?.maxEvents,
        includeNarrative: params?.includeNarrative,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getHomeChronology(
    homeId: string,
    params?: ChronologyQueryParams
  ): Promise<ChronologyResult> {
    const response = await apiRequest<ChronologyEvent[], ApiMeta>({
      path: `/safeguarding/chronology/homes/${homeId}`,
      auth: true,
      query: {
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        eventType: params?.eventType,
        severity: params?.severity,
        source: params?.source,
        confidentialityScope: params?.confidentialityScope,
        maxEvents: params?.maxEvents,
        includeNarrative: params?.includeNarrative,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  // ── Risk Alerts ─────────────────────────────────────────────

  async getRiskAlertRules(): Promise<RiskAlertRule[]> {
    const response = await apiRequest<RiskAlertRule[]>({
      path: "/safeguarding/risk-alerts/rules",
      auth: true,
    })

    return response.data
  },

  async getRiskAlerts(params?: RiskAlertQueryParams): Promise<RiskAlertListResult> {
    const response = await apiRequest<RiskAlert[], ApiMeta>({
      path: "/safeguarding/risk-alerts",
      auth: true,
      query: {
        status: params?.status,
        severity: params?.severity,
        type: params?.type,
        targetType: params?.targetType,
        targetId: params?.targetId,
        ownerUserId: params?.ownerUserId,
        includeNotes: params?.includeNotes,
        confidentialityScope: params?.confidentialityScope,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getRiskAlertById(id: string): Promise<RiskAlert> {
    const response = await apiRequest<RiskAlert>({
      path: `/safeguarding/risk-alerts/${id}`,
      auth: true,
    })

    return response.data
  },

  async evaluateRiskAlerts(): Promise<{ evaluated: number }> {
    const response = await apiRequest<{ evaluated: number }>({
      path: "/safeguarding/risk-alerts/evaluate",
      auth: true,
      method: "POST",
    })

    return response.data
  },

  async acknowledgeRiskAlert(id: string): Promise<RiskAlert> {
    const response = await apiRequest<RiskAlert>({
      path: `/safeguarding/risk-alerts/${id}/acknowledge`,
      auth: true,
      method: "POST",
      body: {},
    })

    return response.data
  },

  async markRiskAlertInProgress(id: string): Promise<RiskAlert> {
    const response = await apiRequest<RiskAlert>({
      path: `/safeguarding/risk-alerts/${id}/in-progress`,
      auth: true,
      method: "POST",
      body: {},
    })

    return response.data
  },

  async resolveRiskAlert(id: string): Promise<RiskAlert> {
    const response = await apiRequest<RiskAlert>({
      path: `/safeguarding/risk-alerts/${id}/resolve`,
      auth: true,
      method: "POST",
      body: {},
    })

    return response.data
  },

  async addRiskAlertNote(id: string, content: string): Promise<RiskAlertNote> {
    const response = await apiRequest<RiskAlertNote>({
      path: `/safeguarding/risk-alerts/${id}/notes`,
      auth: true,
      method: "POST",
      body: { note: content },
    })

    return response.data
  },

  // ── Pattern Mapping ─────────────────────────────────────────

  async getYoungPersonPatterns(
    youngPersonId: string,
    params?: PatternQueryParams
  ): Promise<PatternResult> {
    const response = await apiRequest<PatternResult>({
      path: `/safeguarding/patterns/young-people/${youngPersonId}`,
      auth: true,
      query: {
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        confidentialityScope: params?.confidentialityScope,
        maxIncidents: params?.maxIncidents,
        minOccurrences: params?.minOccurrences,
        confidenceThreshold: params?.confidenceThreshold,
        maxPatterns: params?.maxPatterns,
      },
    })

    return response.data
  },

  async getHomePatterns(
    homeId: string,
    params?: PatternQueryParams
  ): Promise<PatternResult> {
    const response = await apiRequest<PatternResult>({
      path: `/safeguarding/patterns/homes/${homeId}`,
      auth: true,
      query: {
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        confidentialityScope: params?.confidentialityScope,
        maxIncidents: params?.maxIncidents,
        minOccurrences: params?.minOccurrences,
        confidenceThreshold: params?.confidenceThreshold,
        maxPatterns: params?.maxPatterns,
      },
    })

    return response.data
  },

  // ── Reflective Prompts ──────────────────────────────────────

  async getReflectivePrompts(): Promise<ReflectivePromptSet> {
    const response = await apiRequest<ReflectivePromptSet>({
      path: "/safeguarding/reflective-prompts",
      auth: true,
    })

    return response.data
  },

  async saveReflectiveResponses(
    taskId: string,
    responses: ReflectivePromptResponse[]
  ): Promise<void> {
    await apiRequest<unknown>({
      path: `/safeguarding/reflective-prompts/tasks/${taskId}/responses`,
      auth: true,
      method: "POST",
      body: { responses },
    })
  },
}
