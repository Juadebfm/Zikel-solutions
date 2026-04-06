"use client"

import { useCallback, useMemo, useState } from "react"
import { Plus, Sparkles, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search } from "lucide-react"

import { DailyLogTable } from "@/components/daily-logs/daily-log-table"
import { CreateDailyLogDialog } from "@/components/daily-logs/create-daily-log-dialog"
import { DailyLogDetailDialog } from "@/components/daily-logs/daily-log-detail-dialog"
import { AiChatDialog } from "@/components/shared/ai-chat-dialog"
import { useDailyLogList, useDeleteDailyLog } from "@/hooks/api/use-daily-logs"
import type { AskAiPageContext } from "@/services/ai.service"

export default function DailyLogsPage() {
  // Filters
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // UI state
  const [createOpen, setCreateOpen] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Queries
  const logsQuery = useDailyLogList({
    page,
    pageSize,
    search: debouncedSearch || undefined,
  })
  const deleteMutation = useDeleteDailyLog()

  const items = useMemo(() => logsQuery.data?.items ?? [], [logsQuery.data?.items])
  const meta = logsQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0

  const aiContext = useMemo<AskAiPageContext | undefined>(() => {
    if (!logsQuery.data) return undefined

    return {
      items: items.slice(0, 25).map((log) => ({
        id: log.id,
        title: log.title,
        status: log.statusLabel ?? log.status,
        priority: log.priority,
        type: log.categoryLabel || log.category,
        dueDate: log.submittedAt ?? null,
        assignee: log.createdBy?.name ?? "Unknown",
        home: log.relatedEntity?.name ?? undefined,
      })),
      filters: {
        search: debouncedSearch || "all",
      },
      meta: meta
        ? {
            total: meta.total,
            page: meta.page,
            pageSize: meta.pageSize,
            totalPages: meta.totalPages,
          }
        : undefined,
    }
  }, [debouncedSearch, items, logsQuery.data, meta])

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
    // Simple debounce via timeout
    const timeout = setTimeout(() => setDebouncedSearch(value), 300)
    return () => clearTimeout(timeout)
  }, [])

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteId(id)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteId) return
    deleteMutation.mutate(deleteId, {
      onSettled: () => setDeleteId(null),
    })
  }, [deleteId, deleteMutation])

  const handleRowClick = useCallback((id: string) => {
    setViewId(id)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-500 mt-1">Create and manage daily log entries.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Log
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DailyLogTable
            items={items}
            loading={logsQuery.isLoading}
            fetching={logsQuery.isFetching}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
            onRowClick={handleRowClick}
            onDelete={handleDeleteRequest}
          />
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <DailyLogDetailDialog
        logId={viewId}
        open={!!viewId}
        onClose={() => setViewId(null)}
      />

      {/* Create dialog */}
      <CreateDailyLogDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* AI chat dialog */}
      <AiChatDialog
        open={isAiOpen}
        onOpenChange={setIsAiOpen}
        page="daily_logs"
        context={aiContext}
        description="Ask about trends, outstanding logs, and what needs attention in daily logs."
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Daily Log
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this daily log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
