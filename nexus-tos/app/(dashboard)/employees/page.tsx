"use client"

import { Plus, Pencil, Trash2, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"

export default function EmployeesPage() {
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canManageUsers")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-500 mt-1">
          View and manage employee records and assignments.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      <div className="flex gap-2">
        <Button className="gap-2" onClick={() => guard(() => console.log("Add employee"))}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => guard(() => console.log("Edit employee"))}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700" onClick={() => guard(() => console.log("Delete employee"))}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Employee directory and management tools will appear here.
            </p>
          </div>
        </CardContent>
      </Card>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
