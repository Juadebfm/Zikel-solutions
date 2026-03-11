export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  me: {
    profile: ["me", "profile"] as const,
    permissions: ["me", "permissions"] as const,
    preferences: ["me", "preferences"] as const,
  },
  summary: {
    stats: ["summary", "stats"] as const,
    todos: (params: { page: number; pageSize: number; sortBy?: string; sortOrder?: string; search?: string }) =>
      ["summary", "todos", params] as const,
    tasksToApprove: (params: { page: number; pageSize: number }) =>
      ["summary", "tasks-to-approve", params] as const,
    provisions: ["summary", "provisions"] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    widgets: ["dashboard", "widgets"] as const,
  },
  announcements: {
    list: (params: { status?: "read" | "unread"; page: number; limit: number }) =>
      ["announcements", "list", params] as const,
    detail: (id: string) => ["announcements", "detail", id] as const,
  },
} as const
