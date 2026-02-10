"use client"

import { AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ValidationError {
  field: string
  message: string
}

interface ValidationErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errors: ValidationError[]
  title?: string
}

export function ValidationErrorModal({
  open,
  onOpenChange,
  errors,
  title = "Errors",
}: ValidationErrorModalProps) {
  if (errors.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li
                key={`${error.field}-${index}`}
                className="flex items-start gap-2 text-sm text-red-700"
              >
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error.message}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
