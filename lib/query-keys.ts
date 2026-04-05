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
    todosAll: (params: { sortBy?: string; sortOrder?: string; search?: string }) =>
      ["summary", "todos", "all", params] as const,
    tasksToApprove: (params: { page: number; pageSize: number; scope?: "gate" | "popup" | "all" }) =>
      ["summary", "tasks-to-approve", params] as const,
    tasksToApproveAll: (scope: "gate" | "popup" | "all" = "all") =>
      ["summary", "tasks-to-approve", "all", scope] as const,
    taskToApproveDetail: (taskId: string) =>
      ["summary", "tasks-to-approve", "detail", taskId] as const,
    taskReview: (taskId: string) =>
      ["summary", "tasks-to-approve", "review", taskId] as const,
    overdueTasks: (params: { page: number; pageSize: number; search?: string; formGroup?: string }) =>
      ["summary", "overdue-tasks", params] as const,
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
  tenants: {
    memberships: (tenantId: string, params: { status?: string; page: number; limit: number }) =>
      ["tenants", "memberships", tenantId, params] as const,
    membershipsBase: (tenantId: string) => ["tenants", "memberships", tenantId] as const,
    inviteLinks: (tenantId: string, params: { page: number; limit: number }) =>
      ["tenants", "invite-links", tenantId, params] as const,
    inviteLinksBase: (tenantId: string) => ["tenants", "invite-links", tenantId] as const,
    invites: (tenantId: string, params: { status?: string; page: number; limit: number }) =>
      ["tenants", "invites", tenantId, params] as const,
    invitesBase: (tenantId: string) => ["tenants", "invites", tenantId] as const,
  },
  audit: {
    events: (params: {
      search?: string
      action?: string
      actorId?: string
      tenantId?: string
      from?: string
      to?: string
      page: number
      limit: number
    }) => ["audit", "events", params] as const,
    securityAlerts: (params: {
      search?: string
      severity?: string
      status?: string
      page: number
      limit: number
    }) => ["audit", "security-alerts", params] as const,
    detail: (id: string) => ["audit", "detail", id] as const,
  },
  careGroups: {
    list: (params: { page: number; pageSize: number; search?: string; isActive?: boolean }) =>
      ["care-groups", "list", params] as const,
    detail: (id: string) => ["care-groups", "detail", id] as const,
  },
  homes: {
    list: (params: { page: number; pageSize: number; search?: string; careGroupId?: string; isActive?: boolean }) =>
      ["homes", "list", params] as const,
    detail: (id: string) => ["homes", "detail", id] as const,
  },
  employees: {
    list: (params: {
      page: number
      pageSize: number
      search?: string
      homeId?: string
      status?: string
      roleId?: string
      isActive?: boolean
    }) =>
      ["employees", "list", params] as const,
    detail: (id: string) => ["employees", "detail", id] as const,
  },
  vehicles: {
    list: (params: {
      page: number
      pageSize: number
      search?: string
      homeId?: string
      status?: string
      fuelType?: string
      isActive?: boolean
    }) => ["vehicles", "list", params] as const,
    detail: (id: string) => ["vehicles", "detail", id] as const,
  },
  youngPeople: {
    list: (params: { page: number; pageSize: number; search?: string; homeId?: string; isActive?: boolean }) =>
      ["young-people", "list", params] as const,
    detail: (id: string) => ["young-people", "detail", id] as const,
  },
  backend: {
    careGroups: {
      list: ["backend", "care-groups", "list"] as const,
      detail: (id: number) => ["backend", "care-groups", "detail", id] as const,
      stakeholders: (id: number) => ["backend", "care-groups", "stakeholders", id] as const,
    },
    homes: {
      list: (params: { careGroupId?: number }) => ["backend", "homes", "list", params] as const,
    },
    employees: {
      list: ["backend", "employees", "list"] as const,
    },
    youngPeople: {
      list: ["backend", "young-people", "list"] as const,
      rewards: ["backend", "young-people", "rewards"] as const,
      outcomeStars: ["backend", "young-people", "outcome-stars"] as const,
    },
    vehicles: {
      list: ["backend", "vehicles", "list"] as const,
      customInfoFields: ["backend", "vehicles", "custom-info-fields"] as const,
      customInfoGroups: ["backend", "vehicles", "custom-info-groups"] as const,
    },
    settings: {
      home: (category: string) => ["backend", "settings", "home", category] as const,
      employee: (category: string) => ["backend", "settings", "employee", category] as const,
      youngPeople: (category: string) => ["backend", "settings", "young-people", category] as const,
      vehicle: (category: string) => ["backend", "settings", "vehicle", category] as const,
    },
    audit: {
      home: (category: string) => ["backend", "audit", "home", category] as const,
      employee: (category: string) => ["backend", "audit", "employee", category] as const,
      youngPeople: (category: string) => ["backend", "audit", "young-people", category] as const,
      vehicle: (category: string) => ["backend", "audit", "vehicle", category] as const,
    },
    tasks: {
      list: ["backend", "tasks", "list"] as const,
      detail: (id: string) => ["backend", "tasks", "detail", id] as const,
    },
  },
  tasks: {
    list: (params: Record<string, unknown>) => ["tasks", "list", params] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    categories: ["tasks", "categories"] as const,
    formTemplates: ["tasks", "form-templates"] as const,
  },
  forms: {
    list: (params: Record<string, unknown>) => ["forms", "list", params] as const,
    detail: (id: string) => ["forms", "detail", id] as const,
    metadata: ["forms", "metadata"] as const,
  },
  dailyLogs: {
    list: (params: Record<string, unknown>) => ["daily-logs", "list", params] as const,
    detail: (id: string) => ["daily-logs", "detail", id] as const,
  },
  safeguarding: {
    chronologyYoungPerson: (id: string, params: Record<string, unknown>) =>
      ["safeguarding", "chronology", "young-person", id, params] as const,
    chronologyHome: (id: string, params: Record<string, unknown>) =>
      ["safeguarding", "chronology", "home", id, params] as const,
    riskAlerts: (params: Record<string, unknown>) =>
      ["safeguarding", "risk-alerts", params] as const,
    riskAlertDetail: (id: string) =>
      ["safeguarding", "risk-alerts", "detail", id] as const,
    riskAlertRules: ["safeguarding", "risk-alerts", "rules"] as const,
    patternsYoungPerson: (id: string, params: Record<string, unknown>) =>
      ["safeguarding", "patterns", "young-person", id, params] as const,
    patternsHome: (id: string, params: Record<string, unknown>) =>
      ["safeguarding", "patterns", "home", id, params] as const,
    reflectivePrompts: ["safeguarding", "reflective-prompts"] as const,
  },
  reports: {
    reg44Pack: (params: Record<string, unknown>) =>
      ["reports", "reg44-pack", params] as const,
    reg45Pack: (params: Record<string, unknown>) =>
      ["reports", "reg45-pack", params] as const,
    riDashboard: (params: Record<string, unknown>) =>
      ["reports", "ri-dashboard", params] as const,
    riDrilldown: (params: Record<string, unknown>) =>
      ["reports", "ri-drilldown", params] as const,
  },
  documents: {
    list: (params: Record<string, unknown>) => ["documents", "list", params] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
    categories: ["documents", "categories"] as const,
  },
  exports: {
    list: (params: Record<string, unknown>) => ["exports", "list", params] as const,
    detail: (id: string) => ["exports", "detail", id] as const,
  },
  settings: {
    organisation: ["settings", "organisation"] as const,
    notifications: ["settings", "notifications"] as const,
  },
  scheduling: {
    events: (params: Record<string, unknown>) => ["scheduling", "events", params] as const,
    eventDetail: (id: string) => ["scheduling", "events", "detail", id] as const,
    rotas: (params: Record<string, unknown>) => ["scheduling", "rotas", params] as const,
    rotaDetail: (id: string) => ["scheduling", "rotas", "detail", id] as const,
    rotaTemplates: ["scheduling", "rotas", "templates"] as const,
  },
  organisation: {
    regions: (params: Record<string, unknown>) => ["organisation", "regions", params] as const,
    regionDetail: (id: string) => ["organisation", "regions", "detail", id] as const,
    groupings: (params: Record<string, unknown>) => ["organisation", "groupings", params] as const,
    groupingDetail: (id: string) => ["organisation", "groupings", "detail", id] as const,
  },
  sensitiveData: {
    list: (params: Record<string, unknown>) => ["sensitive-data", "list", params] as const,
    detail: (id: string) => ["sensitive-data", "detail", id] as const,
    categories: ["sensitive-data", "categories"] as const,
    accessLog: (id: string) => ["sensitive-data", "access-log", id] as const,
  },
} as const
