"use client"

import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Explorer</h1>
        <p className="text-gray-500 mt-1">
          Browse and search all tasks across your assigned homes.
        </p>
      </div>
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Task search and filtering tools will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
