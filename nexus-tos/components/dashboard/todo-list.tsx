"use client"

import Link from "next/link"
import { ListTodo, FileText, ClipboardList, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TodoItem {
  id: string
  taskId: string
  title: string
  description: string
  status: "due-today" | "due-tomorrow" | "pending" | "overdue"
  time?: string
  type: "medication" | "lab" | "document" | "general"
}

interface TodoListProps {
  items: TodoItem[]
}

const statusStyles = {
  "due-today": "text-red-600",
  "due-tomorrow": "text-amber-600",
  pending: "text-gray-500",
  overdue: "text-red-600",
}

const statusLabels = {
  "due-today": "Due Today",
  "due-tomorrow": "Due Tomorrow",
  pending: "Pending",
  overdue: "Overdue",
}

const typeIcons = {
  medication: FileText,
  lab: ClipboardList,
  document: FileText,
  general: ListTodo,
}

const typeColors = {
  medication: "bg-blue-100 text-blue-600",
  lab: "bg-purple-100 text-purple-600",
  document: "bg-amber-100 text-amber-600",
  general: "bg-gray-100 text-gray-600",
}

export function TodoList({ items }: TodoListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-lg font-semibold">To Do List</CardTitle>
        </div>
        <Link href="/tasks">
          <Button variant="link" className="text-primary p-0 h-auto">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks to display
          </p>
        ) : (
          items.map((item) => {
            const TypeIcon = typeIcons[item.type]
            return (
              <div
                key={item.id}
                className="flex flex-col items-start sm:flex-row sm:items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors min-w-0"
              >
                <div className={cn("p-2 rounded-lg", typeColors[item.type])}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      Task #{item.taskId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.description}
                  </p>
                </div>
                <div className="text-left sm:text-right sm:flex-shrink-0">
                  <p className={cn("text-xs font-medium", statusStyles[item.status])}>
                    {statusLabels[item.status]}
                  </p>
                  {item.time && (
                    <p className="text-xs text-gray-400">{item.time}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
