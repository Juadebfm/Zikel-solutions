"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AiChatDialog } from "@/components/shared/ai-chat-dialog"
import { HomeDetailDrawer } from "@/components/homes/home-detail-drawer"
import { CreateHomeDrawer } from "@/components/homes/create-home-drawer"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { getApiErrorMessage } from "@/lib/api/error"
import { useHomeList } from "@/hooks/api/use-homes"
import type { AskAiPageContext } from "@/services/ai.service"

export default function HomesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const homesQuery = useHomeList({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    isActive: true,
  })

  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    if (homesQuery.error) {
      showError(getApiErrorMessage(homesQuery.error, "Unable to load homes."))
    }
  }, [homesQuery.error, showError])

  const items = useMemo(() => homesQuery.data?.items ?? [], [homesQuery.data?.items])
  const meta = homesQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  const aiContext = useMemo<AskAiPageContext | undefined>(() => {
    if (!homesQuery.data) return undefined

    return {
      items: items.slice(0, 25).map((home) => ({
        id: home.id,
        title: home.name,
        status: home.status,
        assignee: home.admin?.name ?? home.manager,
        extra: {
          phone: home.phoneNumber ?? home.phone ?? "-",
          capacity: String(home.capacity ?? 0),
          occupancy: String(home.counts?.youngPeople ?? home.currentOccupancy ?? 0),
        },
      })),
      filters: { search: debouncedSearch || "all" },
      meta: meta ? { total: meta.total, page: meta.page, pageSize: meta.pageSize, totalPages: meta.totalPages } : undefined,
    }
  }, [debouncedSearch, homesQuery.data, items, meta])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homes</h1>
          <p className="text-gray-500 mt-1">View and manage all registered children&apos;s homes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Home
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search homes..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="rounded-md border relative overflow-x-auto">
              {homesQuery.isFetching && !homesQuery.isLoading && items.length > 0 ? (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-primary/20 overflow-hidden rounded-t-md">
                  <div className="h-full w-1/2 bg-primary/50 animate-pulse rounded-full" />
                </div>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Home Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Care Group</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="hidden sm:table-cell">Address</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {homesQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                        No homes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((home) => (
                      <TableRow key={home.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedHomeId(home.id)}>
                        <TableCell>
                          <button type="button" className="font-medium text-primary hover:underline text-left" onClick={(e) => { e.stopPropagation(); setSelectedHomeId(home.id) }}>
                            {home.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${home.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                            {home.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{home.careGroupName ?? "-"}</TableCell>
                        <TableCell className="text-center">{home.capacity ?? "-"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground truncate max-w-[250px]">{home.address ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedHomeId(home.id) }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}-{rangeEnd} of {totalItems}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    {[10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1 || homesQuery.isLoading} onClick={() => setPage((c) => c - 1)}>
                    <span className="sr-only">Previous page</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                  </Button>
                  <span className="px-2 text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages || homesQuery.isLoading} onClick={() => setPage((c) => c + 1)}>
                    <span className="sr-only">Next page</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AiChatDialog
        open={isAiOpen}
        onOpenChange={setIsAiOpen}
        page="homes"
        context={aiContext}
        description="Ask about home capacity, occupancy, staffing contacts, and status."
      />

      <CreateHomeDrawer open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <HomeDetailDrawer
        homeId={selectedHomeId}
        open={selectedHomeId !== null}
        onClose={() => setSelectedHomeId(null)}
      />
    </div>
  )
}
