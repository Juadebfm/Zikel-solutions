"use client"

import { useCallback, useMemo } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/header"
import { TaskFilterBar } from "@/components/task-explorer/task-filter-bar"
import { TaskTable } from "@/components/task-explorer/task-table"
import { TaskDetailDrawer } from "@/components/task-explorer/task-detail-drawer"
import { useTaskExplorerStore } from "@/stores/task-explorer-store"
import { useTaskList, useTaskCategories, useTaskAction } from "@/hooks/api/use-tasks"
import type { TaskScope } from "@/services/tasks.service"

const SCOPE_TABS: Array<{ value: TaskScope; label: string }> = [
  { value: "all", label: "All Tasks" },
  { value: "my_tasks", label: "My Tasks" },
  { value: "assigned_to_me", label: "Assigned to Me" },
  { value: "approvals", label: "Approvals" },
]

export default function TasksPage() {
  const store = useTaskExplorerStore()
  const queryParams = store.getQueryParams()
  const tasksQuery = useTaskList(queryParams)
  const categoriesQuery = useTaskCategories()
  const taskActionMutation = useTaskAction()

  const meta = tasksQuery.data?.meta
  const items = tasksQuery.data?.items ?? []
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0

  const categoryOptions = useMemo(() => {
    return categoriesQuery.data?.map((c) => ({ value: c.value, label: c.label }))
  }, [categoriesQuery.data])

  const handleAction = useCallback(
    (taskId: string, action: string) => {
      taskActionMutation.mutate({
        taskId,
        payload: { action: action as "approve" | "reject" | "submit" | "reassign" | "comment" | "request_deletion" },
      })
    },
    [taskActionMutation]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Task Explorer" subtitle="Browse, create, and manage tasks." />
        <Button
          className="gap-2"
          onClick={() => store.setCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Scope tabs */}
      <Tabs
        value={store.scope}
        onValueChange={(value) => store.setScope(value as TaskScope)}
      >
        <TabsList>
          {SCOPE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filter bar */}
      <TaskFilterBar
        search={store.search}
        status={store.status}
        type={store.type}
        category={store.category}
        period={store.period}
        showFilters={store.showFilters}
        categories={categoryOptions}
        onSearchChange={store.setSearch}
        onStatusChange={store.setStatus}
        onTypeChange={store.setType}
        onCategoryChange={store.setCategory}
        onPeriodChange={store.setPeriod}
        onToggleFilters={() => store.setShowFilters(!store.showFilters)}
        onReset={store.resetFilters}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <TaskTable
            items={items}
            loading={tasksQuery.isLoading}
            page={store.page}
            pageSize={store.pageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            sortBy={store.sortBy}
            sortOrder={store.sortOrder}
            onPageChange={store.setPage}
            onPageSizeChange={store.setPageSize}
            onSortChange={store.setSorting}
            onRowClick={store.openTaskDrawer}
          />
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <TaskDetailDrawer
        taskId={store.selectedTaskId}
        open={store.drawerOpen}
        onClose={store.closeTaskDrawer}
        onAction={handleAction}
      />
    </div>
  )
}
