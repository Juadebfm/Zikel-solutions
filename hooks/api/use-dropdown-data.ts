/**
 * Hooks for fetching dropdown data used across create/edit dialogs.
 * All queries use long staleTime to avoid refetching on every dialog open.
 */
import { useQuery } from "@tanstack/react-query"

import { homesService } from "@/services/homes.service"
import { youngPeopleService } from "@/services/young-people.service"
import { tenantsService } from "@/services/tenants.service"
import { formsService } from "@/services/forms.service"
import { useAuthSessionStore } from "@/stores/auth-session-store"

const DROPDOWN_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function useHomesDropdown() {
  return useQuery({
    queryKey: ["dropdown", "homes"],
    queryFn: () => homesService.list({ page: 1, pageSize: 100, isActive: true }),
    staleTime: DROPDOWN_STALE_TIME,
    select: (data) =>
      data.items.map((h) => ({ value: h.id, label: h.name })),
  })
}

export function useYoungPeopleDropdown(homeId?: string) {
  return useQuery({
    queryKey: ["dropdown", "young-people", homeId],
    queryFn: () =>
      youngPeopleService.list({
        page: 1,
        pageSize: 100,
        homeId,
        isActive: true,
      }),
    staleTime: DROPDOWN_STALE_TIME,
    enabled: !!homeId,
    select: (data) =>
      data.items.map((yp) => {
        const rec = yp as unknown as Record<string, unknown>
        const first = yp.firstName ?? rec.first_name ?? ""
        const last = yp.lastName ?? rec.last_name ?? ""
        const full = `${first} ${last}`.trim()
        return {
          value: yp.id,
          label: full || (rec.name as string) || "Unknown",
        }
      }),
  })
}

export function useEmployeesDropdown(_homeId?: string) {
  const tenantId = useAuthSessionStore((s) => s.session?.activeTenantId)

  return useQuery({
    queryKey: ["dropdown", "employees", tenantId],
    queryFn: () =>
      tenantsService.listMemberships(tenantId!, { status: "active", page: 1, limit: 100 }),
    staleTime: DROPDOWN_STALE_TIME,
    enabled: Boolean(tenantId),
    select: (data) =>
      data.items.map((m) => {
        const full = `${m.firstName} ${m.lastName}`.trim()
        return {
          value: m.userId ?? m.id,
          label: full || m.email || "Unknown",
        }
      }),
  })
}

export function useFormTemplatesDropdown() {
  return useQuery({
    queryKey: ["dropdown", "form-templates"],
    queryFn: () => formsService.list({ page: 1, pageSize: 100, status: "released" }),
    staleTime: DROPDOWN_STALE_TIME,
    select: (data) =>
      data.items.map((f) => ({ value: f.key, label: f.name })),
  })
}
