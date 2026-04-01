"use client"

import { AlertCircle } from "lucide-react"
import { create } from "zustand"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ErrorModalState {
  open: boolean
  title: string
  message: string
  details?: string[]
  show: (message: string, opts?: { title?: string; details?: string[] }) => void
  hide: () => void
}

export const useErrorModalStore = create<ErrorModalState>()((set) => ({
  open: false,
  title: "Error",
  message: "",
  details: undefined,
  show: (message, opts) =>
    set({
      open: true,
      message,
      title: opts?.title ?? "Error",
      details: opts?.details,
    }),
  hide: () => set({ open: false, message: "", title: "Error", details: undefined }),
}))

export function ErrorModal() {
  const { open, title, message, details, hide } = useErrorModalStore()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && hide()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{message}</p>
          {details && details.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {details.map((detail, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-red-600"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={hide}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
