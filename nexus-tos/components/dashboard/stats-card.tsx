"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  label: string
  value: number
  icon: LucideIcon
  badge: string
  badgeColor: "red" | "blue" | "amber" | "green" | "purple"
  href: string
  iconBgColor?: string
}

const badgeStyles = {
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
}

const iconBgStyles = {
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  badge,
  badgeColor,
  href,
}: StatsCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-lg", iconBgStyles[badgeColor])}>
            <Icon className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              badgeStyles[badgeColor]
            )}
          >
            {badge}
          </span>
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {value.toString().padStart(2, "0")}
        </p>
      </div>
    </Link>
  )
}
