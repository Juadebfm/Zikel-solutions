import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  documentsService,
  type CreateDocumentPayload,
  type DocumentListParams,
  type UpdateDocumentPayload,
} from "@/services/documents.service"

export function useDocumentList(params?: DocumentListParams) {
  const resolvedParams = {
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
  }

  return useQuery({
    queryKey: queryKeys.documents.list(resolvedParams),
    queryFn: () => documentsService.list(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useDocumentDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentsService.getDetail(id),
    enabled: enabled && Boolean(id),
  })
}

export function useDocumentCategories() {
  return useQuery({
    queryKey: queryKeys.documents.categories,
    queryFn: () => documentsService.getCategories(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => documentsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents", "list"] })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      documentsService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["documents", "list"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(variables.id) }),
      ])
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents", "list"] })
    },
  })
}
