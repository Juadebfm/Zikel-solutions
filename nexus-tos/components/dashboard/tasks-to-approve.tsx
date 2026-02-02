"use client"

import { ClipboardCheck, Eye, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ApprovalTask {
  id: string
  requestId: string
  title: string
  caregiver: string
  status: "needs-review" | "pending" | "urgent"
}

interface TasksToApproveProps {
  items: ApprovalTask[]
  onView?: (id: string) => void
  onApprove?: (id: string) => void
  onProcessBatch?: () => void
}

const statusStyles = {
  "needs-review": "bg-amber-100 text-amber-700 border-amber-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels = {
  "needs-review": "NEEDS REVIEW",
  pending: "PENDING",
  urgent: "URGENT",
}

export function TasksToApprove({
  items,
  onView,
  onApprove,
  onProcessBatch,
}: TasksToApproveProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg font-semibold">
            My Tasks to Approve
          </CardTitle>
        </div>
        <Button
          variant="link"
          className="text-primary p-0 h-auto"
          onClick={onProcessBatch}
        >
          Process Batch
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks awaiting approval
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors min-w-0"
            >
              <div className="flex-1 min-w-0 pr-16 sm:pr-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={statusStyles[item.status]}
                  >
                    {statusLabels[item.status]}
                  </Badge>
                  <span className="text-xs text-gray-400">{item.requestId}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">
                  Caregiver: {item.caregiver}
                </p>
              </div>
              <div className="flex items-center gap-1 absolute top-3 right-3 sm:static sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  onClick={() => onView?.(item.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 bg-primary hover:bg-primary/90"
                  onClick={() => onApprove?.(item.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
