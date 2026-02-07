"use client"

import { PieChart, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"

export default function ReportsPage() {
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canViewReports")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bespoke Reporting</h1>
        <p className="text-gray-500 mt-1">
          Generate and export custom reports across all homes.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      <div className="flex gap-2">
        <Button className="gap-2" onClick={() => guard(() => console.log("Generate report"))}>
          <PieChart className="h-4 w-4" />
          Generate Report
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => guard(() => console.log("Export report"))}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <PieChart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Report generation and analytics tools will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
