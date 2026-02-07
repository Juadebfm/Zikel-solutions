"use client"

import { Info } from "lucide-react"

interface AccessBannerProps {
  show: boolean
  message?: string
}

export function AccessBanner({
  show,
  message = "You have view-only access to this page. Some actions are restricted.",
}: AccessBannerProps) {
  if (!show) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <Info className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
