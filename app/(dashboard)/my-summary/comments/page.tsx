"use client"

import { SummaryTaskPage } from "@/components/dashboard/summary-task-page"

export default function CommentsPage() {
  return (
    <SummaryTaskPage
      title="Tasks with Comments"
      statusLabel="Has Comments"
      statusKey="active"
      queryParams={{ summaryScope: "comments", sortBy: "updatedAt", sortOrder: "desc" }}
      actions={[]}
      emptyMessage="No tasks with comments."
    />
  )
}
