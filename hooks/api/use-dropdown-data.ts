/**
 * Hooks for fetching dropdown data used across create/edit dialogs.
 * All queries use long staleTime to avoid refetching on every dialog open.
 */
import { useQuery } from "@tanstack/react-query"

import { homesService } from "@/services/homes.service"
import { youngPeopleService } from "@/services/young-people.service"
import { employeesService } from "@/services/employees.service"
import { formsService } from "@/services/forms.service"

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
      data.items.map((yp) => ({
        value: yp.id,
        label: `${yp.firstName} ${yp.lastName}`.trim(),
      })),
  })
}

export function useEmployeesDropdown(homeId?: string) {
  return useQuery({
    queryKey: ["dropdown", "employees", homeId],
    queryFn: () =>
      employeesService.list({
        page: 1,
        pageSize: 100,
        homeId,
        isActive: true,
      }),
    staleTime: DROPDOWN_STALE_TIME,
    select: (data) =>
      data.items.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`.trim(),
      })),
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
