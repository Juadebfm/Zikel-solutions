"use client"

import { useCallback, useMemo, useState } from "react"
import { Plus, Sparkles, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/layout/header"
import { TaskFilterBar } from "@/components/task-explorer/task-filter-bar"
import { TaskTable } from "@/components/task-explorer/task-table"
import { TaskDetailDrawer } from "@/components/task-explorer/task-detail-drawer"
import { AiChatDialog } from "@/components/shared/ai-chat-dialog"
import { useTaskExplorerStore } from "@/stores/task-explorer-store"
import { useTaskList, useTaskCategories, useTaskAction, useDeleteTask } from "@/hooks/api/use-tasks"
import type { AskAiPageContext } from "@/services/ai.service"
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
  const deleteTaskMutation = useDeleteTask()
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isAiOpen, setIsAiOpen] = useState(false)

  const meta = tasksQuery.data?.meta
  const items = tasksQuery.data?.items ?? []
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0

  const categoryOptions = useMemo(() => {
    return categoriesQuery.data?.map((c) => ({ value: c.value, label: c.label }))
  }, [categoriesQuery.data])

  // Build AI context from current visible data (max 25 items per API spec)
  const aiContext = useMemo<AskAiPageContext | undefined>(() => {
    if (!tasksQuery.data) return undefined

    return {
      items: items.slice(0, 25).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.statusLabel,
        priority: task.priority,
        category: task.categoryLabel,
        dueDate: task.dueAt,
        assignee: task.assignee?.name ?? "Unassigned",
        home: task.relatedEntity?.name ?? undefined,
      })),
      filters: {
        scope: store.scope,
        status: store.status || "all",
        category: store.category || "all",
        period: store.period || "all",
      },
      meta: meta ? {
        total: meta.total,
        page: meta.page,
        pageSize: meta.pageSize,
        totalPages: meta.totalPages,
      } : undefined,
    }
  }, [items, meta, store.scope, store.status, store.category, store.period, tasksQuery.data])

  const handleAiSuggestionAction = useCallback((action: string) => {
    switch (action) {
      case "filter_tasks_overdue":
        store.setStatus("overdue")
        break
      case "filter_tasks_pending_approval":
        store.setScope("approvals")
        break
      case "create_task":
        store.setCreateModalOpen(true)
        setIsAiOpen(false)
        break
    }
  }, [store])

  const handleAction = useCallback(
    (taskId: string, action: string) => {
      taskActionMutation.mutate({
        taskId,
        payload: { action: action as "approve" | "reject" | "submit" | "reassign" | "comment" | "request_deletion" },
      })
    },
    [taskActionMutation]
  )

  const handleDeleteRequest = useCallback((taskId: string) => {
    setDeleteTaskId(taskId)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTaskId) return
    deleteTaskMutation.mutate(deleteTaskId, {
      onSettled: () => setDeleteTaskId(null),
    })
  }, [deleteTaskId, deleteTaskMutation])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Task Explorer" subtitle="Browse, create, and manage tasks." showNewTask={false} showAskAI={false} />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
          <Button
            className="gap-2"
            onClick={() => store.setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
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
            fetching={tasksQuery.isFetching}
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
            onDelete={handleDeleteRequest}
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

      {/* AI Chat dialog */}
      <AiChatDialog
        open={isAiOpen}
        onOpenChange={setIsAiOpen}
        page="tasks"
        context={aiContext}
        description="Ask about your tasks — filter help, overdue items, workload insights, and more."
        onSuggestionAction={handleAiSuggestionAction}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Task
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
