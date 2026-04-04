import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ──────────────────────────────────────────────────────

export interface DocumentItem {
  id: string
  title: string
  description?: string | null
  category: string
  fileId: string
  homeId?: string | null
  homeName?: string | null
  visibility?: string | null
  tags?: string[]
  uploadedBy?: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface DocumentDetail extends DocumentItem {
  downloadUrl?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

export interface DocumentListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  homeId?: string
  uploadedBy?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CreateDocumentPayload {
  title: string
  description?: string
  category: string
  fileId: string
  homeId?: string
  visibility?: string
  tags?: string[]
}

export interface UpdateDocumentPayload {
  title?: string
  description?: string
  category?: string
  homeId?: string
  visibility?: string
  tags?: string[]
}

export interface PaginatedDocuments {
  items: DocumentItem[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const documentsService = {
  async list(params?: DocumentListParams): Promise<PaginatedDocuments> {
    const response = await apiRequest<DocumentItem[], ApiMeta>({
      path: "/documents",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        category: params?.category,
        homeId: params?.homeId,
        uploadedBy: params?.uploadedBy,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getDetail(id: string): Promise<DocumentDetail> {
    const response = await apiRequest<DocumentDetail>({
      path: `/documents/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(payload: CreateDocumentPayload): Promise<DocumentItem> {
    const response = await apiRequest<DocumentItem>({
      path: "/documents",
      auth: true,
      method: "POST",
      body: payload,
    })
    return response.data
  },

  async update(id: string, payload: UpdateDocumentPayload): Promise<DocumentItem> {
    const response = await apiRequest<DocumentItem>({
      path: `/documents/${id}`,
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/documents/${id}`,
      auth: true,
      method: "DELETE",
    })
  },

  async getCategories(): Promise<string[]> {
    const response = await apiRequest<string[]>({
      path: "/documents/categories",
      auth: true,
    })
    return response.data
  },
}
