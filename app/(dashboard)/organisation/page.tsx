"use client"

import { useCallback, useState } from "react"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"

import {
  useRegionList,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
  useGroupingList,
  useCreateGrouping,
  useUpdateGrouping,
  useDeleteGrouping,
} from "@/hooks/api/use-organisation"
import { useHomesDropdown, useEmployeesDropdown } from "@/hooks/api/use-dropdown-data"
import type {
  Region,
  Grouping,
  GroupingType,
  GroupingEntityType,
  CreateRegionPayload,
  CreateGroupingPayload,
} from "@/services/organisation.service"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

// ─── Page ───────────────────────────────────────────────────────

export default function OrganisationPage() {
  const [activeTab, setActiveTab] = useState("regions")
  const { allowed, showModal, setShowModal } = usePermissionGuard("canManageSettings")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Organisation
        </h1>
        <p className="text-gray-500 mt-1">
          Organising your care structure helps ensure every home and team is
          well-supported.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="groupings">Groupings</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="mt-6">
          <RegionsTab allowed={allowed} />
        </TabsContent>

        <TabsContent value="groupings" className="mt-6">
          <GroupingsTab allowed={allowed} />
        </TabsContent>
      </Tabs>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}

// ─── Regions Tab ────────────────────────────────────────────────

function RegionsTab({ allowed }: { allowed: boolean }) {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Region | null>(null)

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const { data, isLoading } = useRegionList({
    page,
    pageSize: 20,
    search: searchQuery || undefined,
  })

  const regions = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)

  const deleteMutation = useDeleteRegion()

  const handleDelete = useCallback(
    (region: Region) => {
      setProcessingIds((prev) => new Set(prev).add(region.id))
      deleteMutation.mutate(region.id, {
        onSuccess: () => {
          showToast(`Region "${region.name}" deleted.`)
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(region.id)
            return next
          })
        },
        onError: (err) => {
          showError(
            isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete region."
          )
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(region.id)
            return next
          })
        },
      })
      setDeleteConfirm(null)
    },
    [deleteMutation, showError, showToast]
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search regions..."
            className="pl-9 h-10"
          />
        </div>

        <Button
          className="gap-2"
          onClick={() => {
            if (!allowed) return
            setCreateOpen(true)
          }}
          disabled={!allowed}
        >
          <Plus className="h-4 w-4" />
          Create Region
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Description</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Homes</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-8 rounded-full mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 rounded-full mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : regions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No regions configured yet.</p>
                </TableCell>
              </TableRow>
            ) : (
              regions.map((region, index) => {
                if (processingIds.has(region.id)) {
                  return (
                    <TableRow key={region.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"} animate-pulse`}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  )
                }
                return (
                  <TableRow key={region.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell className="font-medium text-sm text-gray-900">{region.name}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[300px] truncate">
                      {region.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {region.homeIds.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          region.isActive
                            ? "bg-emerald-100 text-emerald-700 text-xs"
                            : "bg-gray-100 text-gray-500 text-xs"
                        }
                      >
                        {region.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!allowed) return
                            setEditingRegion(region)
                          }}
                          disabled={!allowed}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (!allowed) return
                            setDeleteConfirm(region)
                          }}
                          disabled={!allowed}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <RegionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      <RegionFormDialog
        open={editingRegion !== null}
        onOpenChange={(open) => { if (!open) setEditingRegion(null) }}
        mode="edit"
        region={editingRegion ?? undefined}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Region</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Region Form Dialog ─────────────────────────────────────────

function RegionFormDialog({
  open,
  onOpenChange,
  mode,
  region,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  region?: Region
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedHomeIds, setSelectedHomeIds] = useState<Set<string>>(new Set())

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const createMutation = useCreateRegion()
  const updateMutation = useUpdateRegion()
  const homesQuery = useHomesDropdown()
  const homes = homesQuery.data ?? []

  const isPending = createMutation.isPending || updateMutation.isPending

  // Reset form when dialog opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && mode === "edit" && region) {
        setName(region.name)
        setDescription(region.description ?? "")
        setSelectedHomeIds(new Set(region.homeIds))
      } else if (isOpen && mode === "create") {
        setName("")
        setDescription("")
        setSelectedHomeIds(new Set())
      }
      onOpenChange(isOpen)
    },
    [mode, onOpenChange, region]
  )

  // Sync form when region changes (for edit)
  // Using handleOpenChange covers the open trigger

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      showError("Please provide a region name.")
      return
    }

    const payload: CreateRegionPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      homeIds: Array.from(selectedHomeIds),
    }

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast("Region created successfully.")
          onOpenChange(false)
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to create region.")
        },
      })
    } else if (region) {
      updateMutation.mutate(
        { id: region.id, payload },
        {
          onSuccess: () => {
            showToast("Region updated successfully.")
            onOpenChange(false)
          },
          onError: (err) => {
            showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update region.")
          },
        }
      )
    }
  }, [name, description, selectedHomeIds, mode, region, createMutation, updateMutation, showError, showToast, onOpenChange])

  const toggleHome = (homeId: string) => {
    setSelectedHomeIds((prev) => {
      const next = new Set(prev)
      if (next.has(homeId)) next.delete(homeId)
      else next.add(homeId)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Region" : "Edit Region"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new region and assign homes to it."
              : "Update this region's details and home assignments."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="region-name">Name</Label>
            <Input
              id="region-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North West"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region-description">Description</Label>
            <Textarea
              id="region-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Homes</Label>
            {homesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : homes.length === 0 ? (
              <p className="text-sm text-gray-400">No homes available.</p>
            ) : (
              <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
                {homes.map((home) => (
                  <label
                    key={home.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedHomeIds.has(home.value)}
                      onCheckedChange={() => toggleHome(home.value)}
                    />
                    {home.label}
                  </label>
                ))}
              </div>
            )}
            {selectedHomeIds.size > 0 && (
              <p className="text-xs text-muted-foreground">{selectedHomeIds.size} home(s) selected</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Groupings Tab ──────────────────────────────────────────────

function GroupingsTab({ allowed }: { allowed: boolean }) {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<GroupingType | "">("")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [editingGrouping, setEditingGrouping] = useState<Grouping | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Grouping | null>(null)

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const { data, isLoading } = useGroupingList({
    page,
    pageSize: 20,
    search: searchQuery || undefined,
    type: typeFilter || undefined,
  })

  const groupings = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)

  const deleteMutation = useDeleteGrouping()

  const handleDelete = useCallback(
    (grouping: Grouping) => {
      setProcessingIds((prev) => new Set(prev).add(grouping.id))
      deleteMutation.mutate(grouping.id, {
        onSuccess: () => {
          showToast(`Grouping "${grouping.name}" deleted.`)
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(grouping.id)
            return next
          })
        },
        onError: (err) => {
          showError(
            isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete grouping."
          )
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(grouping.id)
            return next
          })
        },
      })
      setDeleteConfirm(null)
    },
    [deleteMutation, showError, showToast]
  )

  const typeLabel: Record<GroupingType, string> = {
    operational: "Operational",
    reporting: "Reporting",
    custom: "Custom",
  }

  const typeBadgeClass: Record<GroupingType, string> = {
    operational: "bg-blue-100 text-blue-700",
    reporting: "bg-purple-100 text-purple-700",
    custom: "bg-amber-100 text-amber-700",
  }

  const entityTypeLabel: Record<GroupingEntityType, string> = {
    home: "Home",
    employee: "Employee",
    care_group: "Care Group",
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search groupings..."
              className="pl-9 h-10"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v === "all" ? "" : (v as GroupingType))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="reporting">Reporting</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="gap-2"
          onClick={() => {
            if (!allowed) return
            setCreateOpen(true)
          }}
          disabled={!allowed}
        >
          <Plus className="h-4 w-4" />
          Create Grouping
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Type</TableHead>
              <TableHead className="font-semibold text-gray-700">Entity Type</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Entities</TableHead>
              <TableHead className="font-semibold text-gray-700">Description</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-8 rounded-full mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : groupings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No groupings configured yet.</p>
                </TableCell>
              </TableRow>
            ) : (
              groupings.map((grouping, index) => {
                if (processingIds.has(grouping.id)) {
                  return (
                    <TableRow key={grouping.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"} animate-pulse`}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  )
                }
                return (
                  <TableRow key={grouping.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell className="font-medium text-sm text-gray-900">{grouping.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-xs ${typeBadgeClass[grouping.type] ?? "bg-gray-100 text-gray-700"}`}>
                        {typeLabel[grouping.type] ?? grouping.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {entityTypeLabel[grouping.entityType] ?? grouping.entityType}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {grouping.entityIds.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[250px] truncate">
                      {grouping.description || "-"}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!allowed) return
                            setEditingGrouping(grouping)
                          }}
                          disabled={!allowed}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (!allowed) return
                            setDeleteConfirm(grouping)
                          }}
                          disabled={!allowed}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <GroupingFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      <GroupingFormDialog
        open={editingGrouping !== null}
        onOpenChange={(open) => { if (!open) setEditingGrouping(null) }}
        mode="edit"
        grouping={editingGrouping ?? undefined}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Grouping</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Grouping Form Dialog ───────────────────────────────────────

function GroupingFormDialog({
  open,
  onOpenChange,
  mode,
  grouping,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  grouping?: Grouping
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<GroupingType>("operational")
  const [entityType, setEntityType] = useState<GroupingEntityType>("home")
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set())

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const createMutation = useCreateGrouping()
  const updateMutation = useUpdateGrouping()

  // Entity dropdown data based on selected entity type
  const homesQuery = useHomesDropdown()
  const employeesQuery = useEmployeesDropdown()

  const entityOptions =
    entityType === "home"
      ? homesQuery.data ?? []
      : entityType === "employee"
        ? employeesQuery.data ?? []
        : [] // care_group — no dropdown available; user can type IDs or we leave empty
  const entityLoading =
    entityType === "home" ? homesQuery.isLoading : entityType === "employee" ? employeesQuery.isLoading : false

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && mode === "edit" && grouping) {
        setName(grouping.name)
        setDescription(grouping.description ?? "")
        setType(grouping.type)
        setEntityType(grouping.entityType)
        setSelectedEntityIds(new Set(grouping.entityIds))
      } else if (isOpen && mode === "create") {
        setName("")
        setDescription("")
        setType("operational")
        setEntityType("home")
        setSelectedEntityIds(new Set())
      }
      onOpenChange(isOpen)
    },
    [mode, onOpenChange, grouping]
  )

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      showError("Please provide a grouping name.")
      return
    }

    const payload: CreateGroupingPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      entityType,
      entityIds: Array.from(selectedEntityIds),
    }

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast("Grouping created successfully.")
          onOpenChange(false)
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to create grouping.")
        },
      })
    } else if (grouping) {
      updateMutation.mutate(
        { id: grouping.id, payload },
        {
          onSuccess: () => {
            showToast("Grouping updated successfully.")
            onOpenChange(false)
          },
          onError: (err) => {
            showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update grouping.")
          },
        }
      )
    }
  }, [name, description, type, entityType, selectedEntityIds, mode, grouping, createMutation, updateMutation, showError, showToast, onOpenChange])

  const toggleEntity = (entityId: string) => {
    setSelectedEntityIds((prev) => {
      const next = new Set(prev)
      if (next.has(entityId)) next.delete(entityId)
      else next.add(entityId)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Grouping" : "Edit Grouping"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new grouping to organise your entities."
              : "Update this grouping's configuration."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="grouping-name">Name</Label>
            <Input
              id="grouping-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Northern Cluster"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grouping-description">Description</Label>
            <Textarea
              id="grouping-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as GroupingType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select
                value={entityType}
                onValueChange={(v) => {
                  setEntityType(v as GroupingEntityType)
                  setSelectedEntityIds(new Set())
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="care_group">Care Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {entityType === "home" ? "Homes" : entityType === "employee" ? "Employees" : "Care Groups"}
            </Label>
            {entityLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : entityOptions.length === 0 ? (
              <p className="text-sm text-gray-400">
                {entityType === "care_group"
                  ? "Care group selection is not yet available."
                  : "No entities available."}
              </p>
            ) : (
              <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
                {entityOptions.map((entity) => (
                  <label
                    key={entity.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedEntityIds.has(entity.value)}
                      onCheckedChange={() => toggleEntity(entity.value)}
                    />
                    {entity.label}
                  </label>
                ))}
              </div>
            )}
            {selectedEntityIds.size > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedEntityIds.size} {entityType === "home" ? "home" : entityType === "employee" ? "employee" : "care group"}(s) selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
