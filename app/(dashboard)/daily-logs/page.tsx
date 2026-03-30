"use client"

import { useCallback, useState } from "react"
import { Plus, AlertTriangle } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

import { DailyLogTable } from "@/components/daily-logs/daily-log-table"
import { CreateDailyLogDialog } from "@/components/daily-logs/create-daily-log-dialog"
import { useDailyLogList, useDeleteDailyLog } from "@/hooks/api/use-daily-logs"
import { useHomeList } from "@/hooks/api/use-homes"

export default function DailyLogsPage() {
  // Filters
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [homeFilter, setHomeFilter] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // UI state
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Queries
  const logsQuery = useDailyLogList({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    homeId: homeFilter || undefined,
  })
  const homesQuery = useHomeList({ page: 1, pageSize: 100 })
  const deleteMutation = useDeleteDailyLog()

  const items = logsQuery.data?.items ?? []
  const meta = logsQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0
  const homes = homesQuery.data?.items ?? []

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

  const handleRowClick = useCallback((_id: string) => {
    // Detail view can be added later (drawer or route)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-500 mt-1">Create and manage daily log entries.</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Log
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={homeFilter || "all"}
          onValueChange={(v) => { setHomeFilter(v === "all" ? "" : v); setPage(1) }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Homes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Homes</SelectItem>
            {homes.map((home) => (
              <SelectItem key={home.id} value={home.id}>
                {home.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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

      {/* Create dialog */}
      <CreateDailyLogDialog open={createOpen} onOpenChange={setCreateOpen} />

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
