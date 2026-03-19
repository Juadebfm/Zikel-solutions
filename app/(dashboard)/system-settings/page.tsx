"use client"

import { Pencil, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"

export default function SystemSettingsPage() {
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canManageSettings")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure global system preferences and organisation settings.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      <div className="flex gap-2">
        <Button className="gap-2" onClick={() => guard(() => console.log("Edit settings"))}>
          <Pencil className="h-4 w-4" />
          Edit Settings
        </Button>
      </div>

      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <Settings className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              System configuration and preferences will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
