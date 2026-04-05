"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Plus, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useVehicleList } from "@/hooks/api/use-vehicles"
import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { CreateVehicleModernDialog } from "@/components/vehicles/create-vehicle-modern-dialog"
import type { AskAiPageContext } from "@/services/ai.service"

function formatDate(value?: string | null): string {
  if (!value) return "-"
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(parsed))
}

export default function VehiclesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [homeId, setHomeId] = useState("")
  const [status, setStatus] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const homesQuery = useHomesDropdown()
  const vehiclesQuery = useVehicleList({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    homeId: homeId || undefined,
    status: status || undefined,
    fuelType: fuelType || undefined,
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
    if (vehiclesQuery.error) {
      showError(getApiErrorMessage(vehiclesQuery.error, "Unable to load vehicles."))
    }
  }, [showError, vehiclesQuery.error])

  const items = useMemo(() => vehiclesQuery.data?.items ?? [], [vehiclesQuery.data?.items])
  const meta = vehiclesQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  const aiContext = useMemo<AskAiPageContext | undefined>(() => {
    if (!vehiclesQuery.data) return undefined

    return {
      items: items.slice(0, 25).map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.name || `${vehicle.make || ""} ${vehicle.model || ""}`.trim() || vehicle.registration || `Vehicle ${vehicle.id}`,
        status: vehicle.status ?? "-",
        type: "vehicle",
        home: vehicle.homeName ?? undefined,
        extra: {
          registration: vehicle.registration || "-",
          make: vehicle.make || "-",
          model: vehicle.model || "-",
          mileage: String(vehicle.mileage ?? 0),
          nextServiceDate: vehicle.nextServiceDue || "-",
        },
      })),
      filters: {
        search: debouncedSearch || "all",
        homeId: homeId || "all",
        status: status || "all",
        fuelType: fuelType || "all",
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
  }, [debouncedSearch, fuelType, homeId, items, meta, status, vehiclesQuery.data])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500 mt-1">Track and manage the vehicle fleet across all homes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
        <Select value={homeId || "all"} onValueChange={(value) => { setHomeId(value === "all" ? "" : value); setPage(1) }}>
          <SelectTrigger>
            <SelectValue placeholder="All homes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All homes</SelectItem>
            {(homesQuery.data ?? []).map((home) => (
              <SelectItem key={home.value} value={home.value}>
                {home.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status || "all"} onValueChange={(value) => { setStatus(value === "all" ? "" : value); setPage(1) }}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="past">Past</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={fuelType || "all"} onValueChange={(value) => { setFuelType(value === "all" ? "" : value); setPage(1) }}>
          <SelectTrigger>
            <SelectValue placeholder="All fuel types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fuel types</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
            <SelectItem value="Petrol">Petrol</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="Electric">Electric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="rounded-md border relative">
              {vehiclesQuery.isFetching && !vehiclesQuery.isLoading && items.length > 0 ? (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Make / Model</TableHead>
                    <TableHead>Home</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Next Service</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {vehiclesQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((vehicle) => (
                      <TableRow key={vehicle.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {vehicle.name || `${vehicle.make || ""} ${vehicle.model || ""}`.trim() || vehicle.registration || `Vehicle ${vehicle.id}`}
                        </TableCell>
                        <TableCell>{vehicle.registration || "-"}</TableCell>
                        <TableCell>{`${vehicle.make || "-"} / ${vehicle.model || "-"}`}</TableCell>
                        <TableCell>{vehicle.homeName || "-"}</TableCell>
                        <TableCell className="capitalize">{vehicle.status || "-"}</TableCell>
                        <TableCell>{vehicle.mileage ?? "-"}</TableCell>
                        <TableCell>{formatDate(vehicle.nextServiceDue)}</TableCell>
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
                    disabled={page <= 1 || vehiclesQuery.isLoading}
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
                    disabled={page >= totalPages || vehiclesQuery.isLoading}
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
        page="vehicles"
        context={aiContext}
        description="Ask about fleet availability, service schedules, and home allocation coverage."
      />

      <CreateVehicleModernDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
