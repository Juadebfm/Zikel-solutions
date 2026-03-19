import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { backendDataService } from "@/services/backend-data.service"
import type { Vehicle } from "@/types"

export function useCareGroups() {
  return useQuery({
    queryKey: queryKeys.backend.careGroups.list,
    queryFn: () => backendDataService.listCareGroups(),
  })
}

export function useCareGroupDetail(careGroupId: number) {
  return useQuery({
    queryKey: queryKeys.backend.careGroups.detail(careGroupId),
    queryFn: () => backendDataService.getCareGroupById(careGroupId),
    enabled: Number.isFinite(careGroupId),
  })
}

export function useCareGroupStakeholders(careGroupId: number) {
  return useQuery({
    queryKey: queryKeys.backend.careGroups.stakeholders(careGroupId),
    queryFn: () => backendDataService.listCareGroupStakeholders(careGroupId),
    enabled: Number.isFinite(careGroupId),
  })
}

export function useHomes(careGroupId?: number) {
  return useQuery({
    queryKey: queryKeys.backend.homes.list({ careGroupId }),
    queryFn: () => backendDataService.listHomes(careGroupId),
    enabled: careGroupId === undefined || Number.isFinite(careGroupId),
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.backend.employees.list,
    queryFn: () => backendDataService.listEmployees(),
  })
}

export function useYoungPeople() {
  return useQuery({
    queryKey: queryKeys.backend.youngPeople.list,
    queryFn: () => backendDataService.listYoungPeople(),
  })
}

export function useHomeSettings(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.settings.home(category),
    queryFn: () => backendDataService.listHomeSettings(category),
  })
}

export function useHomeAudits(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.audit.home(category),
    queryFn: () => backendDataService.listHomeAudits(category),
  })
}

export function useEmployeeSettings(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.settings.employee(category),
    queryFn: () => backendDataService.listEmployeeSettings(category),
  })
}

export function useEmployeeAudits(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.audit.employee(category),
    queryFn: () => backendDataService.listEmployeeAudits(category),
  })
}

export function useYPSettings(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.settings.youngPeople(category),
    queryFn: () => backendDataService.listYPSettings(category),
  })
}

export function useYPAudits(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.audit.youngPeople(category),
    queryFn: () => backendDataService.listYPAudits(category),
  })
}

export function useYPRewards() {
  return useQuery({
    queryKey: queryKeys.backend.youngPeople.rewards,
    queryFn: () => backendDataService.listYPRewards(),
  })
}

export function useOutcomeStars() {
  return useQuery({
    queryKey: queryKeys.backend.youngPeople.outcomeStars,
    queryFn: () => backendDataService.listOutcomeStars(),
  })
}

export function useTaskExplorerLogs() {
  return useQuery({
    queryKey: queryKeys.backend.taskExplorer.logs,
    queryFn: () => backendDataService.listTaskExplorerLogs(),
  })
}

export function useTaskExplorerFormSubmissions() {
  return useQuery({
    queryKey: queryKeys.backend.taskExplorer.forms,
    queryFn: () => backendDataService.listTaskExplorerFormSubmissions(),
  })
}

export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.backend.vehicles.list,
    queryFn: () => backendDataService.listVehicles(),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<Vehicle, "id">) => backendDataService.createVehicle(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.backend.vehicles.list })
    },
  })
}

export function useVehicleSettings(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.settings.vehicle(category),
    queryFn: () => backendDataService.listVehicleSettings(category),
  })
}

export function useVehicleCustomInfoFields() {
  return useQuery({
    queryKey: queryKeys.backend.vehicles.customInfoFields,
    queryFn: () => backendDataService.listVehicleCustomInfoFields(),
  })
}

export function useVehicleCustomInfoGroups() {
  return useQuery({
    queryKey: queryKeys.backend.vehicles.customInfoGroups,
    queryFn: () => backendDataService.listVehicleCustomInfoGroups(),
  })
}

export function useCreateVehicleCustomInfoField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      fieldName: string
      description: string
      required: boolean
      customGroup: string
      fieldType: string
      defaultValue: string
    }) => backendDataService.createVehicleCustomInfoField(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.backend.vehicles.customInfoFields })
      await queryClient.invalidateQueries({ queryKey: queryKeys.backend.vehicles.customInfoGroups })
    },
  })
}

export function useVehicleAudits(category: string) {
  return useQuery({
    queryKey: queryKeys.backend.audit.vehicle(category),
    queryFn: () => backendDataService.listVehicleAudits(category),
  })
}
