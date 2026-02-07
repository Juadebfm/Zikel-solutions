"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">
          View scheduled shifts, appointments, and upcoming events.
        </p>
      </div>
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Your calendar and schedule will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
