"use client"

import { useEffect, useState, useCallback } from "react"
import { CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { create } from "zustand"

interface ToastState {
  message: string | null
  show: (message: string, durationMs?: number) => void
  hide: () => void
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  show: (message, durationMs = 4000) => {
    set({ message })
    setTimeout(() => set({ message: null }), durationMs)
  },
  hide: () => set({ message: null }),
}))

export function Toast() {
  const message = useToastStore((s) => s.message)
  const hide = useToastStore((s) => s.hide)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    // Small delay to trigger CSS transition
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => {
      cancelAnimationFrame(raf)
      setVisible(false)
    }
  }, [message])

  if (!message) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-sm font-medium text-emerald-800">{message}</p>
        <button
          type="button"
          onClick={hide}
          className="shrink-0 rounded-md p-0.5 text-emerald-400 hover:text-emerald-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
