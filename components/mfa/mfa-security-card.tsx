"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToastStore } from "@/components/shared/toast"
import {
  useDisableMfaTotp,
  useMfaStatus,
  useSetupMfaTotp,
  useVerifySetupMfaTotp,
} from "@/hooks/api/use-mfa"
import { getApiErrorMessage } from "@/lib/api/error"

export function MfaSecurityCard() {
  const { data: status, isLoading } = useMfaStatus()
  const showToast = useToastStore((s) => s.show)

  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  const enabled = Boolean(status?.enabled)
  const backupCodesRemaining = status?.backupCodesRemaining ?? 0
  const lowBackupCodes = enabled && backupCodesRemaining <= 3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          Protect your account with a time-based one-time password (TOTP) from an authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          {enabled ? (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
              <ShieldOff className="h-4 w-4" />
              Not enabled
            </span>
          )}
          {enabled ? (
            <span className="text-muted-foreground">
              · {backupCodesRemaining} backup code{backupCodesRemaining === 1 ? "" : "s"} remaining
            </span>
          ) : null}
        </div>

        {lowBackupCodes ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              You&apos;re running low on backup codes. Regenerate a fresh batch and store them somewhere
              safe.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {enabled ? (
            <>
              <Button type="button" variant="outline" onClick={() => setRegenerateOpen(true)}>
                Regenerate backup codes
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDisableOpen(true)}
              >
                Disable 2FA
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setRegenerateOpen(true)}>
              Set up 2FA
            </Button>
          )}
        </div>
      </CardContent>

      <SetupDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        mode={enabled ? "regenerate" : "enable"}
        onComplete={(msg) => showToast(msg)}
      />

      <DisableDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        onComplete={(msg) => showToast(msg)}
      />
    </Card>
  )
}

// ─── Setup / regenerate dialog ──────────────────────────────────

interface SetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "enable" | "regenerate"
  onComplete: (message: string) => void
}

function SetupDialog({ open, onOpenChange, mode, onComplete }: SetupDialogProps) {
  const setupMutation = useSetupMfaTotp()
  const verifyMutation = useVerifySetupMfaTotp()
  const [stage, setStage] = useState<"start" | "scan" | "verify" | "codes">("start")
  const [code, setCode] = useState("")
  const [setupData, setSetupData] = useState<{ qrCodeDataUri: string; backupCodes: string[] } | null>(null)

  const reset = () => {
    setStage("start")
    setCode("")
    setSetupData(null)
  }

  const handleStart = async () => {
    try {
      const data = await setupMutation.mutateAsync()
      setSetupData({ qrCodeDataUri: data.qrCodeDataUri, backupCodes: data.backupCodes })
      setStage("scan")
    } catch (error) {
      onComplete(getApiErrorMessage(error))
    }
  }

  const handleVerify = async () => {
    if (code.trim().length === 0) return
    try {
      await verifyMutation.mutateAsync(code.trim())
      setStage("codes")
    } catch (error) {
      onComplete(getApiErrorMessage(error))
    }
  }

  const handleClose = () => {
    if (stage === "codes") {
      onComplete(mode === "enable" ? "Two-factor authentication enabled." : "Backup codes regenerated.")
    }
    reset()
    onOpenChange(false)
  }

  const copyAll = async () => {
    if (!setupData) return
    try {
      await navigator.clipboard.writeText(setupData.backupCodes.join("\n"))
      onComplete("Backup codes copied to clipboard.")
    } catch {
      onComplete("Could not copy. Please copy them manually.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "enable" ? "Set up two-factor authentication" : "Regenerate backup codes"}
          </DialogTitle>
          <DialogDescription>
            {mode === "enable"
              ? "Scan the QR code with your authenticator app, then confirm with the 6-digit code."
              : "This invalidates your existing backup codes. Save the new ones somewhere safe."}
          </DialogDescription>
        </DialogHeader>

        {stage === "start" ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              You&apos;ll need an authenticator app like 1Password, Authy, or Google Authenticator.
            </p>
            <Button
              type="button"
              onClick={handleStart}
              disabled={setupMutation.isPending}
              className="w-full"
            >
              {setupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Start setup
            </Button>
          </div>
        ) : null}

        {stage === "scan" && setupData ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-center rounded-md bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrCodeDataUri}
                alt="MFA QR code"
                className="h-44 w-44"
              />
            </div>
            <Button type="button" onClick={() => setStage("verify")} className="w-full">
              I&apos;ve scanned it
            </Button>
          </div>
        ) : null}

        {stage === "verify" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="mfa-setup-code">Enter the 6-digit code</Label>
              <Input
                id="mfa-setup-code"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            <Button
              type="button"
              onClick={handleVerify}
              disabled={code.length !== 6 || verifyMutation.isPending}
              className="w-full"
            >
              {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm
            </Button>
          </div>
        ) : null}

        {stage === "codes" && setupData ? (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Save these backup codes. Each works once if you lose access to your authenticator.
            </p>
            <div className="grid grid-cols-2 gap-1.5 rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
              {setupData.backupCodes.map((c) => (
                <span key={c} className="tabular-nums">
                  {c}
                </span>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={copyAll} className="w-full">
              <Copy className="h-4 w-4" />
              Copy all codes
            </Button>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {stage === "codes" ? "Done" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Disable dialog ─────────────────────────────────────────────

interface DisableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (message: string) => void
}

function DisableDialog({ open, onOpenChange, onComplete }: DisableDialogProps) {
  const disableMutation = useDisableMfaTotp()
  const [password, setPassword] = useState("")

  const reset = () => setPassword("")

  const handleConfirm = async () => {
    if (!password) return
    try {
      await disableMutation.mutateAsync(password)
      onComplete("Two-factor authentication disabled.")
      reset()
      onOpenChange(false)
    } catch (error) {
      onComplete(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication</DialogTitle>
          <DialogDescription>
            For security, confirm your password to disable 2FA. We strongly recommend keeping it on.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="mfa-disable-password">Current password</Label>
          <Input
            id="mfa-disable-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirm}
            disabled={!password || disableMutation.isPending}
          >
            {disableMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Disable 2FA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
