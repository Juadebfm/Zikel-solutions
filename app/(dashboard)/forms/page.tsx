"use client"

import { useState, useMemo } from "react"
import { Plus, ClipboardList, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
import { FormListTable } from "@/components/form-designer/form-list-table"
import { FormDesignerShell } from "@/components/form-designer/form-designer-shell"
import { useFormList, usePublishForm, useArchiveForm, useCloneForm } from "@/hooks/api/use-forms"

export default function FormsPage() {
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canManageSettings")

  // List state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Designer state: null = list view, string = editing form, "new" = creating
  const [designerFormId, setDesignerFormId] = useState<string | null>(null)
  const [showDesigner, setShowDesigner] = useState(false)

  const listParams = useMemo(() => ({
    page,
    pageSize: 20,
    search: search || undefined,
    status: (statusFilter || undefined) as "draft" | "published" | "archived" | undefined,
  }), [page, search, statusFilter])

  const formsQuery = useFormList(listParams)
  const publishMutation = usePublishForm()
  const archiveMutation = useArchiveForm()
  const cloneMutation = useCloneForm()

  const items = formsQuery.data?.items ?? []
  const meta = formsQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0

  const handleCreate = () => {
    guard(() => {
      setDesignerFormId(null)
      setShowDesigner(true)
    })
  }

  const handleEdit = (formId: string) => {
    guard(() => {
      setDesignerFormId(formId)
      setShowDesigner(true)
    })
  }

  const handleBackToList = () => {
    setShowDesigner(false)
    setDesignerFormId(null)
  }

  const handlePublish = (formId: string) => {
    guard(() => publishMutation.mutate(formId))
  }

  const handleArchive = (formId: string) => {
    guard(() => archiveMutation.mutate(formId))
  }

  const handleClone = (formId: string) => {
    guard(() => cloneMutation.mutate(formId))
  }

  // Show designer when creating/editing
  if (showDesigner) {
    return (
      <div className="space-y-4">
        <FormDesignerShell formId={designerFormId} onBack={handleBackToList} />
        <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Designer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage form templates for tasks and procedures.
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          New Form
        </Button>
      </div>

      <AccessBanner show={!allowed} />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <FormListTable
        items={items}
        loading={formsQuery.isLoading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        onEdit={handleEdit}
        onClone={handleClone}
        onArchive={handleArchive}
        onPublish={handlePublish}
      />

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
