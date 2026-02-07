"use client"

import { HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Centre</h1>
        <p className="text-gray-500 mt-1">
          Find answers to common questions and get support.
        </p>
      </div>
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <HelpCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Help articles and support resources will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
