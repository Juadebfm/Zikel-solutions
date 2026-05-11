"use client"

import * as React from "react"
import Link from "next/link"
import { Clock, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsReadOnly } from "@/hooks/api/use-billing"
import { useCooldown } from "@/hooks/use-cooldown"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

/**
 * Drop-in <Button> replacement for actions that mutate server state.
 *
 * Disables itself when:
 *   1. The tenant's subscription is in past-due read-only / incomplete mode.
 *   2. The button's `cooldownFamily` has a rate-limit cool-down active
 *      (server returned 429 with `x-ratelimit-reset`).
 *
 * Hovering the disabled button explains why and (for read-only) links to
 * the billing page. Server enforces both gates regardless.
 *
 * Use this for: Save / Update / Delete / Submit / Approve / Send invite /
 * Export / Upload / "Send" on AI composers. Do NOT use for read-only
 * navigation buttons or for tasks that should remain available during
 * read-only (e.g. opening the billing portal).
 */
export interface MutationButtonProps extends ButtonProps {
  /**
   * Optional override — set to true to skip the read-only gate even
   * during past-due (e.g. the "Update card" button in the banner).
   */
  ignoreReadOnly?: boolean
  /**
   * Custom tooltip text for the read-only state.
   */
  readOnlyTooltip?: string
  /**
   * Route-family key (e.g. `"ai"`, `"auth"`, `"billing"`) used to read the
   * rate-limit cooldown store. When a cooldown is active for this family,
   * the button disables and renders a "Try in Ns" countdown.
   */
  cooldownFamily?: string
}

export const MutationButton = React.forwardRef<HTMLButtonElement, MutationButtonProps>(
  function MutationButton(
    {
      ignoreReadOnly,
      readOnlyTooltip = "Subscription is past due — update billing to re-enable.",
      cooldownFamily,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const isReadOnly = useIsReadOnly()
    const cooldown = useCooldown(cooldownFamily ?? null)
    const readOnlyGate = !ignoreReadOnly && isReadOnly
    const cooldownGate = cooldown.isActive
    const gated = readOnlyGate || cooldownGate
    const combinedDisabled = disabled || gated

    const cooldownLabel =
      cooldownGate
        ? cooldown.secondsRemaining < 60
          ? `Try in ${cooldown.secondsRemaining}s`
          : `Try in ${Math.ceil(cooldown.secondsRemaining / 60)}m`
        : null

    const button = (
      <Button
        ref={ref}
        disabled={combinedDisabled}
        aria-disabled={combinedDisabled || undefined}
        className={cn(className, gated && "cursor-not-allowed")}
        {...props}
      >
        {readOnlyGate ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {cooldownGate && !readOnlyGate ? <Clock className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {cooldownGate && !readOnlyGate ? cooldownLabel : children}
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
          {readOnlyGate ? (
            <>
              <p className="text-sm font-medium">{readOnlyTooltip}</p>
              <Link
                href="/settings/billing"
                className="mt-1 inline-block text-xs text-primary underline-offset-2 hover:underline"
              >
                Open billing settings →
              </Link>
            </>
          ) : (
            <p className="text-sm font-medium">
              Rate limit hit. Try again in {cooldown.secondsRemaining}s.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    )
  },
)
