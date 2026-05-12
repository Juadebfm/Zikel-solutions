"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Bot, ShieldOff } from "lucide-react"

import { ConversationSidebar } from "@/components/ai/conversation-sidebar"
import { ConversationThread } from "@/components/ai/conversation-thread"
import { MessageComposer } from "@/components/ai/message-composer"
import { useToastStore } from "@/components/shared/toast"
import { useCanUseAi, useConversation, useSendMessage } from "@/hooks/api/use-ai"
import { useIsReadOnly } from "@/hooks/api/use-billing"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getApiErrorMessage, isApiClientError } from "@/lib/api/error"

export default function AiChatPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const showToast = useToastStore((s) => s.show)

  const canUseAi = useCanUseAi()
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(activeId)
  const sendMessage = useSendMessage(activeId ?? "")
  const isReadOnly = useIsReadOnly()

  const isArchived = Boolean(conversation?.archivedAt)

  const disabledReason = useMemo(() => {
    if (!activeId) return "Start a new chat to begin."
    if (isArchived) return "This conversation is archived. Start a new chat to continue."
    if (isReadOnly) return "Subscription past due — AI is paused until billing is up to date."
    return null
  }, [activeId, isArchived, isReadOnly])

  // Clear the pending message bubble whenever the active conversation changes.
  useEffect(() => {
    setPendingUserMessage(null)
  }, [activeId])

  const handleSend = async (content: string) => {
    if (!activeId) return
    setPendingUserMessage(content)
    try {
      await sendMessage.mutateAsync(content)
    } catch (error) {
      const message = getApiErrorMessage(error)
      showToast(message)
      if (isApiClientError(error) && error.code === "CONVERSATION_ARCHIVED") {
        // Surface the archive state so disabledReason picks it up.
      }
    } finally {
      setPendingUserMessage(null)
    }
  }

  if (!canUseAi) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldOff className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardTitle>AI is not available for your account</CardTitle>
            <CardDescription>
              Contact your organization Owner to enable AI access. They can adjust per-role and
              per-user limits in Settings → Billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/my-summary">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-border bg-background">
      <div className="hidden w-72 shrink-0 sm:block">
        <ConversationSidebar
          activeId={activeId}
          onSelect={setActiveId}
          onCreated={setActiveId}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Bot className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold sm:text-lg">
                {conversation?.title?.trim() || (activeId ? "New chat" : "Zikel AI")}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {activeId
                  ? "Multi-turn assistant — your conversations are saved."
                  : "Pick a chat on the left or start a new one."}
              </p>
            </div>
          </div>
        </header>

        {activeId ? (
          <ConversationThread
            messages={conversation?.messages ?? []}
            pendingUserMessage={pendingUserMessage}
            isLoading={isLoadingConversation && !conversation}
            isWaitingForAssistant={sendMessage.isPending}
          />
        ) : (
          <EmptyState />
        )}

        <MessageComposer
          onSend={handleSend}
          disabled={Boolean(disabledReason)}
          disabledReason={disabledReason}
          isSending={sendMessage.isPending}
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <Bot className="h-10 w-10 opacity-50" />
      <h2 className="text-base font-semibold text-foreground">Welcome to Zikel AI</h2>
      <p className="max-w-sm text-sm">
        Start a new conversation from the sidebar. AI calls are drawn from your plan&apos;s monthly
        pool, plus any top-ups you&apos;ve purchased.
      </p>
    </div>
  )
}
