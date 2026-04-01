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
    href: "/my-summary/overdue-tasks",
  },
  {
    label: "Tasks Due Today",
    value: 21,
    icon: CalendarCheck,
    color: "blue",
    href: "/my-summary/due-today",
  },
  {
    label: "Pending Approval",
    value: 14,
    icon: ClipboardCheck,
    color: "purple",
    href: "/my-summary/pending-approval",
  },
  {
    label: "Rejected Tasks",
    value: 0,
    icon: XCircle,
    color: "orange",
    href: "/my-summary/rejected",
  },
  {
    label: "Draft Tasks",
    value: 2,
    icon: FileEdit,
    color: "amber",
    href: "/my-summary/drafts",
  },
  {
    label: "Future Tasks",
    value: 52,
    icon: CalendarDays,
    color: "green",
    href: "/my-summary/future",
  },
  {
    label: "Comments",
    value: 0,
    icon: MessageSquare,
    color: "pink",
    href: "/my-summary/comments",
  },
  {
    label: "Pending Rewards",
    value: 0,
    icon: Gift,
    color: "teal",
    href: "/my-summary/rewards",
  },
  {
    label: "Today's Events",
    value: 0,
    icon: CalendarClock,
    color: "indigo",
    href: "/calendar",
  },
  {
    label: "Acknowledgements",
    value: 0,
    icon: HandshakeIcon,
    color: "gray",
    href: "/acknowledgements",
  },
]

interface StatsOverviewProps {
  stats?: StatItem[]
  loading?: boolean
}

export function StatsOverview({ stats = defaultStats, loading }: StatsOverviewProps) {
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
          loading={loading}
        />
      ))}
    </div>
  )
}
