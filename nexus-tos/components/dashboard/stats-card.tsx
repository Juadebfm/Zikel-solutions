"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  label: string
  value: number
  icon: LucideIcon
  color: "red" | "blue" | "amber" | "green" | "purple" | "gray" | "teal" | "orange"
  href: string
}

const colorStyles = {
  red: { bg: "bg-red-50", icon: "text-red-500", value: "text-red-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500", value: "text-blue-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-500", value: "text-amber-600" },
  green: { bg: "bg-green-50", icon: "text-green-500", value: "text-green-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", value: "text-purple-600" },
  gray: { bg: "bg-gray-50", icon: "text-gray-500", value: "text-gray-600" },
  teal: { bg: "bg-teal-50", icon: "text-teal-500", value: "text-teal-600" },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", value: "text-orange-600" },
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: StatsCardProps) {
  const styles = colorStyles[color]

  return (
    <Link href={href}>
      <div className={cn(
        "rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("p-2 rounded-lg", styles.bg)}>
            <Icon className={cn("h-4 w-4", styles.icon)} />
          </div>
        </div>
        <p className={cn("text-2xl font-bold", styles.value)}>
          {value.toString().padStart(2, "0")}
        </p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </Link>
  )
}
