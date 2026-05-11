"use client"

import * as React from "react"
import Link from "next/link"
import { Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsReadOnly } from "@/hooks/api/use-billing"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

/**
 * Drop-in <Button> replacement for actions that mutate server state.
 *
 * Disables itself when the tenant's subscription is in past-due read-only
 * or incomplete mode. Hovering the disabled button explains why and links
 * to the billing page. Server enforces the same gate (402) regardless.
 *
 * Use this for: Save / Update / Delete / Submit / Approve / Send invite /
 * Export / Upload / "Send" on AI composers. Do NOT use for read-only
 * navigation buttons or for tasks that should remain available during
 * read-only (e.g. opening the billing portal — that's how users escape).
 */
export interface MutationButtonProps extends ButtonProps {
  /**
   * Optional override — set to true to skip the read-only gate even
   * during past-due (e.g. the "Update card" button in the banner).
   */
  ignoreReadOnly?: boolean
  /**
   * Custom tooltip text. Defaults to a billing-aware explanation.
   */
  readOnlyTooltip?: string
}

export const MutationButton = React.forwardRef<HTMLButtonElement, MutationButtonProps>(
  function MutationButton(
    {
      ignoreReadOnly,
      readOnlyTooltip = "Subscription is past due — update billing to re-enable.",
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const isReadOnly = useIsReadOnly()
    const gated = !ignoreReadOnly && isReadOnly
    const combinedDisabled = disabled || gated

    const button = (
      <Button
        ref={ref}
        disabled={combinedDisabled}
        aria-disabled={combinedDisabled || undefined}
        className={cn(className, gated && "cursor-not-allowed")}
        {...props}
      >
        {gated ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {children}
      </Button>
    )

    if (!gated) return button

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrap in span so tooltip works on disabled buttons */}
          <span className="inline-flex">{button}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm font-medium">{readOnlyTooltip}</p>
          <Link
            href="/settings/billing"
            className="mt-1 inline-block text-xs text-primary underline-offset-2 hover:underline"
          >
            Open billing settings →
          </Link>
        </TooltipContent>
      </Tooltip>
    )
  },
)
