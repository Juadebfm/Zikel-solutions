"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Search, Sparkles } from "lucide-react"

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
import { EmployeeDetailDrawer } from "@/components/employees/employee-detail-drawer"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { getApiErrorMessage } from "@/lib/api/error"
import { useEmployeeList } from "@/hooks/api/use-employees"
import { CreateEmployeeWithUserDialog } from "@/components/employees/create-employee-with-user-dialog"
import type { EmployeeRecord } from "@/services/employees.service"
import type { AskAiPageContext } from "@/services/ai.service"

function getEmployeeName(emp: EmployeeRecord): string {
  const first = emp.user?.firstName ?? emp.firstName ?? ""
  const last = emp.user?.lastName ?? emp.lastName ?? ""
  const full = `${first} ${last}`.trim()
  return full || emp.user?.name || emp.email || emp.user?.email || "Unknown"
}

function getEmployeeEmail(emp: EmployeeRecord): string {
  return emp.user?.email ?? emp.email ?? "-"
}

export default function EmployeesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

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
      items: items.slice(0, 25).map((emp) => ({
        id: emp.id,
        title: getEmployeeName(emp),
        status: emp.status,
        type: emp.roleName ?? emp.role,
        home: emp.homeName,
        extra: {
          email: getEmployeeEmail(emp),
          jobTitle: emp.jobTitle ?? "-",
        },
      })),
      filters: { search: debouncedSearch || "all" },
      meta: meta ? { total: meta.total, page: meta.page, pageSize: meta.pageSize, totalPages: meta.totalPages } : undefined,
    }
  }, [debouncedSearch, employeesQuery.data, items, meta])

  const handleSearchChange = useCallback((value: string) => { setSearch(value); setPage(1) }, [])
  const handlePageSizeChange = useCallback((size: number) => { setPageSize(size); setPage(1) }, [])

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
        <Input placeholder="Search employees..." value={search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="rounded-md border relative overflow-x-auto">
              {employeesQuery.isFetching && !employeesQuery.isLoading && items.length > 0 ? (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-primary/20 overflow-hidden rounded-t-md">
                  <div className="h-full w-1/2 bg-primary/50 animate-pulse rounded-full" />
                </div>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead className="hidden md:table-cell">Job Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Home</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {employeesQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((emp) => (
                      <TableRow key={emp.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedEmployeeId(emp.id)}>
                        <TableCell className="font-medium text-primary">{getEmployeeName(emp)}</TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">{emp.roleName ?? emp.user?.role ?? emp.role ?? "-"}</TableCell>
                        <TableCell className="hidden md:table-cell">{emp.jobTitle ?? "-"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{emp.homeName ?? "-"}</TableCell>
                        <TableCell className="capitalize">{emp.status ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEmployeeId(emp.id) }}>
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
              <p className="text-sm text-muted-foreground">Showing {rangeStart}-{rangeEnd} of {totalItems}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page</span>
                  <select className="h-8 rounded-md border bg-background px-2 text-sm" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
                    {[10, 20, 50].map((size) => (<option key={size} value={size}>{size}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1 || employeesQuery.isLoading} onClick={() => setPage((c) => c - 1)}>
                    <span className="sr-only">Previous page</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                  </Button>
                  <span className="px-2 text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages || employeesQuery.isLoading} onClick={() => setPage((c) => c + 1)}>
                    <span className="sr-only">Next page</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AiChatDialog open={isAiOpen} onOpenChange={setIsAiOpen} page="employees" context={aiContext} description="Ask about employee coverage, role distribution, and assignment risks." />

      <CreateEmployeeWithUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EmployeeDetailDrawer
        employeeId={selectedEmployeeId}
        open={selectedEmployeeId !== null}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  )
}
