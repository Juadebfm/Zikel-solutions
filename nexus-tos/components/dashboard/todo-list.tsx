"use client"

import Link from "next/link"
import { ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface TodoItem {
  id: string
  taskId: string
  title: string
  relatedTo: string
  dueDate: string
  status: "draft" | "not-started" | "in-progress" | "overdue"
  assignee: {
    name: string
    initials: string
    color: string
  }
}

interface TodoListProps {
  items: TodoItem[]
}

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 border-gray-200" },
  "not-started": { label: "Not Started", className: "bg-amber-100 text-amber-700 border-amber-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200" },
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
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks to display
          </p>
        ) : (
          items.map((item) => {
            const status = statusConfig[item.status]
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className={cn("text-white text-xs font-medium", item.assignee.color)}>
                    {item.assignee.initials}
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
                  <Link href={`/tasks/${item.taskId}`}>
                    <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-xs">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
