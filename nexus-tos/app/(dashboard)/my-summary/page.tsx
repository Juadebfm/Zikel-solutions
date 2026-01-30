"use client"

import { useAuth } from "@/contexts/auth-context"
import { mockStats } from "@/lib/mock-data"
import { dashboardStatsConfig } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function MySummaryPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your tasks and activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardStatsConfig.map((stat) => {
          const Icon = stat.icon
          const value = mockStats[stat.key as keyof typeof mockStats]

          return (
            <Link key={stat.key} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgLight}`}>
                      <Icon className={`h-5 w-5 ${stat.textColor}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Placeholder content */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">My To Do List</h2>
            <p className="text-muted-foreground text-sm">
              Task list component will be implemented in Phase 2.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks to Approve</h2>
            <p className="text-muted-foreground text-sm">
              Approval queue component will be implemented in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
