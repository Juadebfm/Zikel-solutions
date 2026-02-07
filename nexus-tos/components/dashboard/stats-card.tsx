"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatsColor =
  | "red"
  | "blue"
  | "purple"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "pink"
  | "gray"
  | "indigo"

interface StatsCardProps {
  label: string
  value: number
  icon: LucideIcon
  color: StatsColor
  href: string
}

const colorStyles: Record<StatsColor, { border: string; label: string; icon: string; value: string }> = {
  red:    { border: "border-red-500",    label: "text-red-600",    icon: "text-red-500",    value: "text-red-600" },
  blue:   { border: "border-blue-700",   label: "text-blue-700",   icon: "text-blue-600",   value: "text-blue-700" },
  purple: { border: "border-purple-600", label: "text-purple-600", icon: "text-purple-500", value: "text-purple-600" },
  orange: { border: "border-orange-500", label: "text-orange-600", icon: "text-orange-500", value: "text-orange-600" },
  amber:  { border: "border-amber-600",  label: "text-amber-700",  icon: "text-amber-600",  value: "text-amber-700" },
  green:  { border: "border-green-500",  label: "text-green-600",  icon: "text-green-500",  value: "text-green-600" },
  teal:   { border: "border-teal-500",   label: "text-teal-600",   icon: "text-teal-500",   value: "text-teal-600" },
  pink:   { border: "border-pink-500",   label: "text-pink-600",   icon: "text-pink-500",   value: "text-pink-600" },
  gray:   { border: "border-gray-500",   label: "text-gray-600",   icon: "text-gray-500",   value: "text-gray-600" },
  indigo: { border: "border-indigo-500", label: "text-indigo-600", icon: "text-indigo-500", value: "text-indigo-600" },
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
        "rounded-lg border-2 bg-white p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer",
        styles.border
      )}>
        <p className={cn("text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 truncate", styles.label)}>
          {label}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 shrink-0", styles.icon)} />
          <span className={cn("text-xl sm:text-2xl font-bold", styles.value)}>
            {value}
          </span>
        </div>
      </div>
    </Link>
  )
}
