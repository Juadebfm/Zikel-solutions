"use client"

import { useState, type KeyboardEvent } from "react"
import { Loader2, SendHorizontal } from "lucide-react"

import { MutationButton } from "@/components/ui/mutation-button"
import { Textarea } from "@/components/ui/textarea"
import { QuotaPill } from "@/components/ai/quota-pill"
import { useQuota } from "@/hooks/api/use-billing"
import { cn } from "@/lib/utils"

interface MessageComposerProps {
  onSend: (content: string) => Promise<void> | void
  disabled?: boolean
  disabledReason?: string | null
  isSending?: boolean
}

const MAX_MESSAGE_CHARS = 8000

export function MessageComposer({
  onSend,
  disabled,
  disabledReason,
  isSending,
}: MessageComposerProps) {
  const [value, setValue] = useState("")
  const { data: quota } = useQuota()
  const outOfCalls = quota ? quota.remainingCalls <= 0 : false

  const trimmed = value.trim()
  const canSend = !disabled && !isSending && !outOfCalls && trimmed.length > 0

  const reasonText = disabledReason
    ?? (outOfCalls ? "Out of AI calls. Top up to continue." : null)

  const handleSend = async () => {
    if (!canSend) return
    const content = trimmed
    setValue("")
    await onSend(content)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="border-t border-border bg-background p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        {reasonText ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {reasonText}
          </div>
        ) : null}

        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border bg-background p-2 transition focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
            disabled && "opacity-60",
          )}
        >
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, MAX_MESSAGE_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Messaging is unavailable right now" : "Ask Zikel AI…"}
            disabled={disabled || isSending}
            rows={1}
            className="min-h-[40px] resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
          />

          <div className="flex shrink-0 items-center gap-2 pl-1 pr-1">
            <QuotaPill />
            <MutationButton
              type="button"
              size="icon-sm"
              onClick={handleSend}
              disabled={!canSend}
              cooldownFamily="ai"
              aria-label="Send message"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </MutationButton>
          </div>
        </div>

        <p className="text-right text-[10px] text-muted-foreground">
          Shift + Enter for newline · {trimmed.length}/{MAX_MESSAGE_CHARS}
        </p>
      </div>
    </div>
  )
}
