"use client"

import { ClipboardCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface ApprovalTask {
  id: string
  taskId: string
  title: string
  relatedTo: string
  dueDate: string
  status: "sent-for-approval" | "needs-review" | "urgent"
  submitter: {
    name: string
    initials: string
    color: string
  }
}

interface TasksToApproveProps {
  items: ApprovalTask[]
  onView?: (id: string) => void
  onApprove?: (id: string) => void
  onProcessBatch?: () => void
  pageSize?: number
}

const statusConfig = {
  "sent-for-approval": { label: "Sent for Approval", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "needs-review": { label: "Needs Review", className: "bg-amber-100 text-amber-700 border-amber-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
}

export function TasksToApprove({
  items,
  onView,
  onApprove,
  onProcessBatch,
  pageSize = 3,
}: TasksToApproveProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / pageSize)
  const paginatedItems = items.slice(page * pageSize, (page + 1) * pageSize)

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
      <CardContent>
        <div className="space-y-2">
          {paginatedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tasks awaiting approval
            </p>
          ) : (
            paginatedItems.map((item) => {
              const status = statusConfig[item.status]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={cn("text-white text-xs font-medium", item.submitter.color)}>
                      {item.submitter.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        #{item.taskId}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {item.relatedTo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">{item.dueDate}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] shrink-0", status.className)}>
                      {status.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary h-7 px-2 text-xs"
                      onClick={() => onView?.(item.id)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
