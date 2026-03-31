"use client"

import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Loader2, MessageCircleDashed, Sparkles, User2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import { useAskAi } from "@/hooks/api/use-ai"
import type { AskAiContext, AskAiPage, AskAiResponse } from "@/services/ai.service"

// ─── Types ───────────────────────────────────────────────────────

type AiChatRole = "user" | "assistant" | "system"

interface AiMessageMetadata {
  source: AskAiResponse["source"]
  model: AskAiResponse["model"]
  statsSource: AskAiResponse["statsSource"]
  generatedAt: AskAiResponse["generatedAt"]
}

interface AiChatMessage {
  id: string
  role: AiChatRole
  content: string
  createdAt: string
  meta?: AiMessageMetadata
  suggestions?: AskAiResponse["suggestions"]
}

export interface AiChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: AskAiPage
  context?: AskAiContext
  description?: string
  onSuggestionAction?: (action: string) => void
}

// ─── Helpers ─────────────────────────────────────────────────────

function createChatMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function compactText(value: string, limit: number): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  return normalized.length <= limit ? normalized : `${normalized.slice(0, limit)}...`
}

function buildAskAiQuery(query: string, conversation: AiChatMessage[]): string {
  const recentTurns = conversation
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-6)
    .map((m) => ({
      role: m.role,
      content: compactText(m.content, 350),
    }))

  if (recentTurns.length === 0) return query

  const history = recentTurns
    .map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.content}`)
    .join("\n")

  return [
    "Use the recent conversation context to answer the latest user question.",
    "Conversation:",
    history,
    "",
    `Latest question: ${query}`,
  ].join("\n")
}

function getAskAiErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    if (error.status === 400 || error.status === 422) {
      return "Your prompt was invalid. Please enter a clearer question."
    }
    if (error.status === 429) {
      return getApiErrorMessage(error, "Too many AI requests. Please wait a moment and try again.")
    }
    if (error.status >= 500) {
      return "AI is temporarily unavailable. Please try again shortly."
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return "Unable to get AI response right now."
}

// ─── Markdown parsing ────────────────────────────────────────────

type AiRenderedBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "label"; label: string; body?: string }

function parseAiContent(content: string): AiRenderedBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: AiRenderedBlock[] = []
  let index = 0

  while (index < lines.length) {
    const currentLine = lines[index].trim()

    if (!currentLine) {
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(currentLine)) {
      const items: string[] = []
      while (index < lines.length) {
        const line = lines[index].trim()
        const match = line.match(/^[-*]\s+(.*)$/)
        if (!match) break
        items.push(match[1].trim())
        index += 1
      }
      if (items.length > 0) blocks.push({ type: "bullets", items })
      continue
    }

    const labelMatch = currentLine.match(/^\*\*(.+?)\*\*:?\s*(.*)$/)
    if (labelMatch) {
      blocks.push({
        type: "label",
        label: labelMatch[1].trim(),
        body: labelMatch[2].trim() || undefined,
      })
      index += 1
      continue
    }

    let paragraph = currentLine
    index += 1
    while (index < lines.length) {
      const nextLine = lines[index].trim()
      if (!nextLine || /^[-*]\s+/.test(nextLine) || /^\*\*(.+?)\*\*:?\s*(.*)$/.test(nextLine)) break
      paragraph = `${paragraph} ${nextLine}`
      index += 1
    }
    blocks.push({ type: "paragraph", text: paragraph })
  }

  return blocks
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, index) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/)
    if (match) {
      return (
        <strong key={`strong-${index}`} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      )
    }
    return <Fragment key={`text-${index}`}>{part}</Fragment>
  })
}

function FormattedAiContent({ content }: { content: string }) {
  const blocks = parseAiContent(content)
  return (
    <div className="space-y-3 text-sm leading-6 text-gray-800">
      {blocks.map((block, index) => {
        if (block.type === "label") {
          return (
            <p key={`label-${index}`} className="text-sm leading-6">
              <span className="font-semibold text-gray-900">{block.label}:</span>{" "}
              {block.body ? renderInlineFormatting(block.body) : null}
            </p>
          )
        }
        if (block.type === "bullets") {
          return (
            <ul key={`bullets-${index}`} className="space-y-1.5 pl-5 list-disc marker:text-primary/70">
              {block.items.map((item, itemIndex) => (
                <li key={`bullet-${index}-${itemIndex}`}>{renderInlineFormatting(item)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={`paragraph-${index}`} className="text-sm leading-6">
            {renderInlineFormatting(block.text)}
          </p>
        )
      })}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────

export function AiChatDialog({
  open,
  onOpenChange,
  page,
  context,
  description = "Ask anything about the data on this page.",
  onSuggestionAction,
}: AiChatDialogProps) {
  const askAiMutation = useAskAi()
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, askAiMutation.isPending])

  const submitQuery = useCallback(
    async (queryOverride?: string) => {
      const text = (queryOverride ?? query).trim()
      if (text.length < 3) {
        setError("Please enter at least 3 characters.")
        return
      }

      setError(null)
      const userMessage: AiChatMessage = {
        id: createChatMessageId(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      }
      const conversation = [...chatMessages, userMessage]
      setChatMessages((prev) => [...prev, userMessage])
      setQuery("")

      try {
        const response = await askAiMutation.mutateAsync({
          query: buildAskAiQuery(text, conversation),
          page,
          context,
        })

        setChatMessages((prev) => [
          ...prev,
          {
            id: createChatMessageId(),
            role: "assistant",
            content: response.answer,
            createdAt: response.generatedAt,
            meta: {
              source: response.source,
              model: response.model,
              statsSource: response.statsSource,
              generatedAt: response.generatedAt,
            },
            suggestions: response.suggestions,
          },
        ])
      } catch (err) {
        const message = getAskAiErrorMessage(err)
        setError(message)
        setChatMessages((prev) => [
          ...prev,
          {
            id: createChatMessageId(),
            role: "system",
            content: message,
            createdAt: new Date().toISOString(),
          },
        ])
      }
    },
    [query, chatMessages, askAiMutation, page, context]
  )

  const handleSubmit = () => void submitQuery()

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void submitQuery()
    }
  }

  const handleSuggestionClick = (action: string, label: string) => {
    if (onSuggestionAction) {
      onSuggestionAction(action)
    }
    void submitQuery(label)
  }

  const handleReset = () => {
    setError(null)
    setChatMessages([])
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden gap-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 px-6 pt-6">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            Ask AI
          </DialogTitle>
          <DialogDescription className="px-6 pb-4">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Chat area */}
          <div className="rounded-2xl border border-gray-200 bg-[radial-gradient(circle_at_12%_20%,rgba(249,115,22,0.08),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(16,185,129,0.09),transparent_30%),linear-gradient(180deg,#ffffff,#f8fafc)] p-3">
            <div className="max-h-[26rem] overflow-y-auto space-y-3 pr-1">
              {chatMessages.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white/80 p-5 text-center">
                  <MessageCircleDashed className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 font-medium">Start a conversation</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ask anything about the data on this page and keep following up.
                  </p>
                </div>
              )}

              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : message.role === "assistant"
                        ? "justify-start"
                        : "justify-center"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="max-w-[86%] rounded-2xl rounded-br-md bg-primary text-white px-4 py-3 shadow-sm">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/80">
                        <User2 className="h-3.5 w-3.5" />
                        You
                      </div>
                      <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : message.role === "assistant" ? (
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm space-y-3">
                      <FormattedAiContent content={message.content} />

                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={`${message.id}-${suggestion.action}-${index}`}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion.action, suggestion.label)}
                              disabled={askAiMutation.isPending}
                              className="bg-white"
                            >
                              {suggestion.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[92%] rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                      {message.content}
                    </div>
                  )}
                </div>
              ))}

              {askAiMutation.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="space-y-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question... (Enter to send, Shift+Enter for newline)"
              className="min-h-20 max-h-48 resize-y"
              maxLength={1200}
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Conversation stays active while this window is open.</span>
              <span>{query.length}/1200</span>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50/70">
          <Button
            variant="ghost"
            type="button"
            onClick={handleReset}
            disabled={askAiMutation.isPending || chatMessages.length === 0}
          >
            New Chat
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={askAiMutation.isPending}
          >
            Close
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={askAiMutation.isPending}>
            {askAiMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Ask AI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
