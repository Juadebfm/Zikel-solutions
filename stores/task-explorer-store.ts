import { create } from "zustand"

import type { TaskListParams, TaskScope } from "@/services/tasks.service"

interface TaskExplorerState {
  // Filters
  scope: TaskScope
  search: string
  status: string
  type: string
  category: string
  period: string
  dateFrom: string
  dateTo: string
  formGroup: string
  page: number
  pageSize: number
  sortBy: string
  sortOrder: "asc" | "desc"

  // UI state
  showFilters: boolean
  selectedTaskId: string | null
  drawerOpen: boolean
  createModalOpen: boolean

  // Actions
  setScope: (scope: TaskScope) => void
  setSearch: (search: string) => void
  setStatus: (status: string) => void
  setType: (type: string) => void
  setCategory: (category: string) => void
  setPeriod: (period: string) => void
  setDateRange: (from: string, to: string) => void
  setFormGroup: (formGroup: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void
  setShowFilters: (show: boolean) => void
  openTaskDrawer: (taskId: string) => void
  closeTaskDrawer: () => void
  setCreateModalOpen: (open: boolean) => void
  resetFilters: () => void
  getQueryParams: () => TaskListParams
}

export const useTaskExplorerStore = create<TaskExplorerState>((set, get) => ({
  scope: "all",
  search: "",
  status: "",
  type: "",
  category: "",
  period: "",
  dateFrom: "",
  dateTo: "",
  formGroup: "",
  page: 1,
  pageSize: 20,
  sortBy: "dueAt",
  sortOrder: "asc",
  showFilters: false,
  selectedTaskId: null,
  drawerOpen: false,
  createModalOpen: false,

  setScope: (scope) => set({ scope, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setType: (type) => set({ type, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setPeriod: (period) => set({ period, page: 1, dateFrom: "", dateTo: "" }),
  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo, period: "custom", page: 1 }),
  setFormGroup: (formGroup) => set({ formGroup, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setShowFilters: (showFilters) => set({ showFilters }),
  openTaskDrawer: (taskId) => set({ selectedTaskId: taskId, drawerOpen: true }),
  closeTaskDrawer: () => set({ selectedTaskId: null, drawerOpen: false }),
  setCreateModalOpen: (createModalOpen) => set({ createModalOpen }),

  resetFilters: () =>
    set({
      search: "",
      status: "",
      type: "",
      category: "",
      period: "",
      dateFrom: "",
      dateTo: "",
      formGroup: "",
      page: 1,
    }),

  getQueryParams: () => {
    const state = get()
    const isApprovedTab = state.scope === "approved"
    const params: TaskListParams = {
      page: state.page,
      pageSize: state.pageSize,
      sortBy: isApprovedTab ? "updatedAt" : state.sortBy,
      sortOrder: isApprovedTab ? "desc" : state.sortOrder,
      scope: isApprovedTab ? "all" : state.scope,
      ...(isApprovedTab && { approvalStatus: "approved" }),
    }

    if (state.search) params.search = state.search
    if (state.status) params.status = state.status
    if (state.type) params.type = state.type
    if (state.category) params.category = state.category
    if (state.period && state.period !== "custom") params.period = state.period
    if (state.dateFrom) params.dateFrom = state.dateFrom
    if (state.dateTo) params.dateTo = state.dateTo
    if (state.formGroup) params.formGroup = state.formGroup

    return params
  },
}))
