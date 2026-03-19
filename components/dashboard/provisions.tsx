"use client"

import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProvisionEvent {
  id: string
  title: string
  time: string
  type: "appointment" | "visit" | "review" | "meeting"
  typeLabel: string
  assignedTo: string
  assignees: string
  avatar?: string
  initials: string
  avatarColor: string
}

export interface ProvisionShift {
  id: string
  name: string
  role: string
  shift: string
  initials: string
  avatarColor: string
}

export interface HomeProvision {
  id: string
  name: string
  events: ProvisionEvent[]
  shifts: ProvisionShift[]
}

interface ProvisionsProps {
  homes: HomeProvision[]
}

const eventTypeBadge = {
  appointment: "bg-gray-200 text-gray-700",
  visit: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  meeting: "bg-purple-100 text-purple-700",
}

export function Provisions({ homes }: ProvisionsProps) {
  return (
    <div className="space-y-6">
      {homes.map((home) => (
        <Card key={home.id}>
          {/* Home Header */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <div className="p-1.5 sm:p-2 bg-white rounded-lg border border-gray-200">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{home.name}</h3>
          </div>

          <CardContent className="p-0">
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Events for Today */}
              <div className="p-4 sm:p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Events for Today
                </h4>
                {home.events.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">
                    No Events For Today
                  </p>
                ) : (
                  <div className="space-y-3">
                    {home.events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                            {event.avatar && <AvatarImage src={event.avatar} />}
                            <AvatarFallback className={cn("text-white text-xs font-medium", event.avatarColor)}>
                              {event.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {event.title} {event.time}
                              </p>
                              <Badge className={cn("text-xs shrink-0 font-normal", eventTypeBadge[event.type])}>
                                {event.type}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                              <div>
                                <span className="text-gray-900 font-medium">{event.typeLabel}</span>
                                <span className="block text-gray-400">Type(S)</span>
                              </div>
                              <div>
                                <span className="text-gray-900 font-medium">{event.assignedTo}</span>
                                <span className="block text-gray-400">Assigned To</span>
                              </div>
                              <div>
                                <span className="text-gray-900 font-medium">{event.assignees}</span>
                                <span className="block text-gray-400">Assignees</span>
                              </div>
                            </div>
                            <Link
                              href={`/tasks/${event.id}`}
                              className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline"
                            >
                              view task
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shifts For Today */}
              <div className="p-4 sm:p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Shifts For Today
                </h4>
                {home.shifts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">
                    No Shifts For Today
                  </p>
                ) : (
                  <div className="space-y-2">
                    {home.shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={cn("text-white text-xs font-medium", shift.avatarColor)}>
                            {shift.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {shift.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {shift.role}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {shift.shift}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
