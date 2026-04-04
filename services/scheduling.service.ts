import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Calendar Types ─────────────────────────────────────────────

export type CalendarEventType = "shift" | "appointment" | "meeting" | "deadline" | "other"

export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  type: CalendarEventType
  startAt: string
  endAt: string
  allDay: boolean
  homeId?: string | null
  homeName?: string | null
  attendeeIds?: string[]
  attendeeNames?: string[]
  recurrence?: string | null
  createdAt: string
  updatedAt: string
}

export interface CalendarEventListParams {
  homeId?: string
  dateFrom?: string
  dateTo?: string
  type?: CalendarEventType
  page?: number
  pageSize?: number
}

export interface CreateCalendarEventPayload {
  title: string
  description?: string
  type: CalendarEventType
  startAt: string
  endAt: string
  homeId?: string
  attendeeIds?: string[]
  recurrence?: string
  allDay?: boolean
}

export interface UpdateCalendarEventPayload {
  title?: string
  description?: string
  type?: CalendarEventType
  startAt?: string
  endAt?: string
  homeId?: string
  attendeeIds?: string[]
  recurrence?: string
  allDay?: boolean
}

// ─── Rota Types ─────────────────────────────────────────────────

export interface RotaShift {
  employeeId: string
  employeeName?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  role: string
}

export interface Rota {
  id: string
  homeId: string
  homeName?: string | null
  weekStarting: string
  shifts: RotaShift[]
  createdAt: string
  updatedAt: string
}

export interface RotaListParams {
  homeId?: string
  weekStarting?: string
  employeeId?: string
  page?: number
  pageSize?: number
}

export interface CreateRotaPayload {
  homeId: string
  weekStarting: string
  shifts: Omit<RotaShift, "employeeName">[]
}

export interface RotaTemplate {
  id: string
  name: string
  homeId?: string | null
  homeName?: string | null
  shifts: Omit<RotaShift, "employeeName">[]
  createdAt: string
}

export interface CreateRotaTemplatePayload {
  name: string
  homeId?: string
  shifts: Omit<RotaShift, "employeeName">[]
}

// ─── Paginated ──────────────────────────────────────────────────

export interface PaginatedCalendarEvents {
  items: CalendarEvent[]
  meta: ApiMeta
}

export interface PaginatedRotas {
  items: Rota[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const schedulingService = {
  // ── Calendar ────────────────────────────────────────────────

  async listEvents(params?: CalendarEventListParams): Promise<PaginatedCalendarEvents> {
    const response = await apiRequest<CalendarEvent[], ApiMeta>({
      path: "/calendar/events",
      auth: true,
      query: {
        homeId: params?.homeId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        type: params?.type,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getEvent(id: string): Promise<CalendarEvent> {
    const response = await apiRequest<CalendarEvent>({
      path: `/calendar/events/${id}`,
      auth: true,
    })
    return response.data
  },

  async createEvent(payload: CreateCalendarEventPayload): Promise<CalendarEvent> {
    const response = await apiRequest<CalendarEvent>({
      path: "/calendar/events",
      auth: true,
      method: "POST",
      body: payload,
    })
    return response.data
  },

  async updateEvent(id: string, payload: UpdateCalendarEventPayload): Promise<CalendarEvent> {
    const response = await apiRequest<CalendarEvent>({
      path: `/calendar/events/${id}`,
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return response.data
  },

  async deleteEvent(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/calendar/events/${id}`,
      auth: true,
      method: "DELETE",
    })
  },

  // ── Rotas ───────────────────────────────────────────────────

  async listRotas(params?: RotaListParams): Promise<PaginatedRotas> {
    const response = await apiRequest<Rota[], ApiMeta>({
      path: "/rotas",
      auth: true,
      query: {
        homeId: params?.homeId,
        weekStarting: params?.weekStarting,
        employeeId: params?.employeeId,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getRota(id: string): Promise<Rota> {
    const response = await apiRequest<Rota>({
      path: `/rotas/${id}`,
      auth: true,
    })
    return response.data
  },

  async createRota(payload: CreateRotaPayload): Promise<Rota> {
    const response = await apiRequest<Rota>({
      path: "/rotas",
      auth: true,
      method: "POST",
      body: payload,
    })
    return response.data
  },

  async updateRota(id: string, payload: Partial<CreateRotaPayload>): Promise<Rota> {
    const response = await apiRequest<Rota>({
      path: `/rotas/${id}`,
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return response.data
  },

  async deleteRota(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/rotas/${id}`,
      auth: true,
      method: "DELETE",
    })
  },

  async listRotaTemplates(): Promise<RotaTemplate[]> {
    const response = await apiRequest<RotaTemplate[]>({
      path: "/rotas/templates",
      auth: true,
    })
    return response.data
  },

  async createRotaTemplate(payload: CreateRotaTemplatePayload): Promise<RotaTemplate> {
    const response = await apiRequest<RotaTemplate>({
      path: "/rotas/templates",
      auth: true,
      method: "POST",
      body: payload,
    })
    return response.data
  },
}
