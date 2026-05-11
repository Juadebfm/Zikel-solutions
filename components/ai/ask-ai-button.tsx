"use client"

import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCanUseAi } from "@/hooks/api/use-ai"
import { cn } from "@/lib/utils"

interface AskAiButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

/**
 * Drop-in replacement for the page-level "Ask AI" Button. Reads
 * `user.aiAccessEnabled` and returns null when AI is disabled for the
 * current user — server still enforces with 403 AI_DISABLED_FOR_TENANT.
 */
export function AskAiButton({ onClick, label = "Ask AI", className }: AskAiButtonProps) {
  const canUseAi = useCanUseAi()
  if (!canUseAi) return null

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("gap-2", className)}
      onClick={onClick}
    >
      <Sparkles className="h-4 w-4" />
      {label}
    </Button>
  )
}
