"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Plus, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { useErrorModalStore } from "@/components/shared/error-modal"
import { getApiErrorMessage } from "@/lib/api/error"
import { useEmployeeList } from "@/hooks/api/use-employees"
import { CreateEmployeeWithUserDialog } from "@/components/employees/create-employee-with-user-dialog"
import type { AskAiPageContext } from "@/services/ai.service"

function formatDate(value?: string): string {
  if (!value) return "-"
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(parsed))
}

export default function EmployeesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const employeesQuery = useEmployeeList({
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
    if (employeesQuery.error) {
      showError(getApiErrorMessage(employeesQuery.error, "Unable to load employees."))
    }
  }, [employeesQuery.error, showError])

  const items = useMemo(() => employeesQuery.data?.items ?? [], [employeesQuery.data?.items])
  const meta = employeesQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  const aiContext = useMemo<AskAiPageContext | undefined>(() => {
    if (!employeesQuery.data) return undefined

    return {
      items: items.slice(0, 25).map((employee) => ({
        id: employee.id,
        title: `${employee.firstName} ${employee.lastName}`.trim(),
        status: employee.status,
        type: employee.role,
        home: employee.homeName,
        extra: {
          email: employee.email,
          phone: employee.phone ?? "-",
          jobTitle: employee.jobTitle ?? "-",
          startDate: employee.startDate ?? "-",
        },
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
  }, [debouncedSearch, employeesQuery.data, items, meta])

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
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 mt-1">View and manage employee records and assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="rounded-md border relative overflow-x-auto">
              {employeesQuery.isFetching && !employeesQuery.isLoading && items.length > 0 ? (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Home</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {employeesQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{`${employee.firstName} ${employee.lastName}`.trim()}</TableCell>
                        <TableCell className="capitalize">{employee.role || "-"}</TableCell>
                        <TableCell>{employee.jobTitle || "-"}</TableCell>
                        <TableCell>{employee.homeName || "-"}</TableCell>
                        <TableCell>{employee.email || "-"}</TableCell>
                        <TableCell className="capitalize">{employee.status || "-"}</TableCell>
                        <TableCell>{formatDate(employee.startDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
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
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1 || employeesQuery.isLoading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <span className="sr-only">Previous page</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>

                  <span className="px-2 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages || employeesQuery.isLoading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <span className="sr-only">Next page</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
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
        page="employees"
        context={aiContext}
        description="Ask about employee coverage, role distribution, and assignment risks."
      />

      <CreateEmployeeWithUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
