"use client"

import { AlertTriangle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AuthErrorDialogProps {
  open: boolean
  message: string
  onOpenChange: (open: boolean) => void
  title?: string
}

export function AuthErrorDialog({
  open,
  message,
  onOpenChange,
  title = "Something went wrong",
}: AuthErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-red-100 p-0 overflow-hidden" showCloseButton={false}>
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 px-6 py-5 border-b border-red-100">
          <DialogHeader className="text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-gray-900">{title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {message}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 flex justify-end">
          <Button type="button" onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
            Okay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
