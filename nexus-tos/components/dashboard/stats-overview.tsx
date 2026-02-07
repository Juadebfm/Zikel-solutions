"use client"

import {
  Clock,
  CalendarCheck,
  ClipboardCheck,
  XCircle,
  FileEdit,
  CalendarDays,
  MessageSquare,
  Gift,
  CalendarClock,
  HandshakeIcon,
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import type { StatsColor } from "@/components/dashboard/stats-card"
import type { LucideIcon } from "lucide-react"

export interface StatItem {
  label: string
  value: number
  icon: LucideIcon
  color: StatsColor
  href: string
}

export const defaultStats: StatItem[] = [
  {
    label: "Overdue Tasks",
    value: 2,
    icon: Clock,
    color: "red",
    href: "/tasks?filter=overdue",
  },
  {
    label: "Tasks Due Today",
    value: 21,
    icon: CalendarCheck,
    color: "blue",
    href: "/tasks?filter=today",
  },
  {
    label: "Pending Approval",
    value: 14,
    icon: ClipboardCheck,
    color: "purple",
    href: "/tasks?filter=approval",
  },
  {
    label: "Rejected Tasks",
    value: 0,
    icon: XCircle,
    color: "orange",
    href: "/tasks?filter=rejected",
  },
  {
    label: "Draft Tasks",
    value: 2,
    icon: FileEdit,
    color: "amber",
    href: "/tasks?filter=draft",
  },
  {
    label: "Future Tasks",
    value: 52,
    icon: CalendarDays,
    color: "green",
    href: "/tasks?filter=future",
  },
  {
    label: "Comments",
    value: 0,
    icon: MessageSquare,
    color: "pink",
    href: "/tasks?filter=comments",
  },
  {
    label: "Pending Rewards",
    value: 0,
    icon: Gift,
    color: "teal",
    href: "/tasks?filter=rewards",
  },
  {
    label: "Today's Events",
    value: 0,
    icon: CalendarClock,
    color: "indigo",
    href: "/calendar?filter=today",
  },
  {
    label: "Acknowledgements",
    value: 0,
    icon: HandshakeIcon,
    color: "gray",
    href: "/tasks?filter=acknowledgements",
  },
]

interface StatsOverviewProps {
  stats?: StatItem[]
}

export function StatsOverview({ stats = defaultStats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <StatsCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          href={stat.href}
        />
      ))}
    </div>
  )
}
