"use client"

import { useEffect, useRef } from "react"
import { Bot, MessageSquare, User, WifiOff } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { AiMessage } from "@/services/ai.service"

interface ConversationThreadProps {
  messages: AiMessage[]
  pendingUserMessage: string | null
  isLoading: boolean
  isWaitingForAssistant: boolean
}

export function ConversationThread({
  messages,
  pendingUserMessage,
  isLoading,
  isWaitingForAssistant,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, pendingUserMessage, isWaitingForAssistant])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="ml-auto h-16 w-2/3" />
        <Skeleton className="h-16 w-3/4" />
      </div>
    )
  }

  const hasContent = messages.length > 0 || pendingUserMessage !== null

  if (!hasContent) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
          <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-base font-semibold">Start a conversation</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask Zikel AI about your care home — overdue tasks, daily logs, safeguarding patterns,
            anything you need to know.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {pendingUserMessage !== null ? (
          <MessageBubble
            message={{
              id: "__pending__",
              role: "user",
              content: pendingUserMessage,
              createdAt: new Date().toISOString(),
            }}
            isPending
          />
        ) : null}

        {isWaitingForAssistant ? <AssistantTyping /> : null}

        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: AiMessage
  isPending?: boolean
}

function MessageBubble({ message, isPending }: MessageBubbleProps) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md border border-border bg-background",
          isPending && "opacity-70",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.fallbackUsed ? (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            <WifiOff className="h-3 w-3" />
            Offline fallback
          </span>
        ) : null}
      </div>
    </div>
  )
}

function AssistantTyping() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-background px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
      </div>
    </div>
  )
}
