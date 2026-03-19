"use client"

import { ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface NoPermissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoPermissionModal({ open, onOpenChange }: NoPermissionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Permission Required</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            You do not have the required permissions to perform this action.
            Please contact your administrator if you believe this is an error.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
