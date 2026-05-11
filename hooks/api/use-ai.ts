import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  aiService,
  type AiConversation,
  type AskAiPayload,
} from "@/services/ai.service"
import { useAuthSessionStore } from "@/stores/auth-session-store"

export function useAskAi() {
  return useMutation({
    mutationFn: (payload: AskAiPayload) => aiService.ask(payload),
  })
}

/**
 * Whether AI is available for the current user. Reads `user.aiAccessEnabled`
 * from the session store. Defaults to `true` when the flag is undefined
 * (older BE shapes that don't return the field) so we don't accidentally hide
 * AI entry points for legitimate users. Returns `false` only when the BE
 * explicitly says AI is off for this user.
 */
export function useCanUseAi(): boolean {
  const user = useAuthSessionStore((s) => s.user)
  if (!user) return false
  return user.aiAccessEnabled !== false
}

// ─── Conversations ─────────────────────────────────────────────

interface UseConversationsParams {
  page?: number
  pageSize?: number
  includeArchived?: boolean
}

export function useConversations(params: UseConversationsParams = {}, enabled = true) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const includeArchived = params.includeArchived ?? false
  return useQuery({
    queryKey: queryKeys.ai.conversations({ page, pageSize, includeArchived }),
    queryFn: () => aiService.listConversations({ page, pageSize, includeArchived }),
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useConversation(id: string | null, enabled = true) {
  return useQuery({
    queryKey: id ? queryKeys.ai.conversation(id) : ["ai", "conversations", "detail", "none"],
    queryFn: () => {
      if (!id) throw new Error("Conversation id missing")
      return aiService.getConversation(id)
    },
    enabled: enabled && Boolean(id),
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => aiService.createConversation(),
    onSuccess: async (conversation) => {
      queryClient.setQueryData(queryKeys.ai.conversation(conversation.id), conversation)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversationsBase })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => aiService.sendMessage(conversationId, content),
    onSuccess: async (result) => {
      const cached = queryClient.getQueryData<AiConversation>(
        queryKeys.ai.conversation(conversationId),
      )
      if (cached) {
        queryClient.setQueryData<AiConversation>(queryKeys.ai.conversation(conversationId), {
          ...cached,
          messages: [...cached.messages, result.assistantMessage],
          updatedAt: result.assistantMessage.createdAt,
        })
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversationsBase })
      await queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota })
    },
  })
}

export function usePatchConversation(conversationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title?: string | null; archived?: boolean }) =>
      aiService.patchConversation(conversationId, payload),
    onSuccess: async (summary) => {
      const cached = queryClient.getQueryData<AiConversation>(
        queryKeys.ai.conversation(conversationId),
      )
      if (cached) {
        queryClient.setQueryData<AiConversation>(queryKeys.ai.conversation(conversationId), {
          ...cached,
          title: summary.title,
          archivedAt: summary.archivedAt,
          updatedAt: summary.updatedAt,
        })
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversationsBase })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => aiService.deleteConversation(conversationId),
    onSuccess: async (_, conversationId) => {
      queryClient.removeQueries({ queryKey: queryKeys.ai.conversation(conversationId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversationsBase })
    },
  })
}
