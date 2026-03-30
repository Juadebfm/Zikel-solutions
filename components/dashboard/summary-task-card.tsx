"use client"

import { type ReactNode } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SummaryTaskCardProps {
  title: string
  taskId: string
  relatedTo: string
  dueDate: string
  personName: string
  personLabel?: string
  subjectLabel?: string
  avatarInitials: string
  avatarColor: string
  badges?: ReactNode
  actions?: ReactNode
}

export function SummaryTaskCard({
  title,
  taskId,
  relatedTo,
  dueDate,
  personName,
  personLabel = "Assigned to",
  subjectLabel = "Subject",
  avatarInitials,
  avatarColor,
  badges,
  actions,
}: SummaryTaskCardProps) {
  return (
    <article className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0">
            <AvatarFallback className={cn("text-white text-sm font-semibold", avatarColor)}>
              {avatarInitials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold text-gray-900 sm:text-xl">
              {title}
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-3 sm:gap-4">
              <TaskMetaBlock label="Task ID" value={taskId} />
              <TaskMetaBlock label={subjectLabel} value={relatedTo} withDivider />
              <TaskMetaBlock label="Due Date" value={dueDate} withDivider />
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {personLabel}: {personName}
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start sm:self-stretch">
          <div className="flex flex-wrap items-center gap-2">{badges}</div>
          <div className="shrink-0">{actions}</div>
        </div>
      </div>
    </article>
  )
}

function TaskMetaBlock({
  label,
  value,
  withDivider = false,
}: {
  label: string
  value: string
  withDivider?: boolean
}) {
  return (
    <div className={cn(withDivider ? "sm:border-l sm:border-gray-300 sm:pl-4" : "")}>
      <p className="truncate text-sm font-semibold text-gray-900 sm:text-lg sm:leading-tight">
        {value}
      </p>
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
    </div>
  )
}
