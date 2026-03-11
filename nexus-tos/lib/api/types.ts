export interface ApiMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiErrorPayload {
  code: string
  message: string
  details?: unknown
}

export interface ApiSuccess<T, M = ApiMeta> {
  success: true
  data: T
  meta?: M
}

export interface ApiFailure {
  success: false
  error: ApiErrorPayload
}

export type ApiResponse<T, M = ApiMeta> = ApiSuccess<T, M> | ApiFailure
