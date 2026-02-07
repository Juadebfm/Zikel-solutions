"use client"

import { Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your personal account preferences and notifications.
        </p>
      </div>
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <Settings className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Your personal settings and preferences will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
