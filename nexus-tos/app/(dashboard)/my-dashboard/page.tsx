"use client"

import { BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function MyDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">
          View your personal performance metrics and activity overview.
        </p>
      </div>
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Your personal dashboard and analytics will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
