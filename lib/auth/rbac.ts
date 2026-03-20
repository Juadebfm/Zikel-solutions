import type { TenantRole, UserRole } from "@/types"

const HOME_EMPLOYEE_YOUNG_PEOPLE_WRITE_ROLES: readonly UserRole[] = ["admin", "manager"]
const VEHICLE_WRITE_ROLES: readonly UserRole[] = ["super_admin", "admin", "manager"]
const CARE_GROUP_WRITE_ROLES: readonly UserRole[] = ["admin"]
const ANNOUNCEMENT_WRITE_ROLES: readonly UserRole[] = ["admin"]
const AI_ACCESS_GLOBAL_ROLES: readonly UserRole[] = ["super_admin", "admin"]
const TENANT_ADMINISTRATION_GLOBAL_ROLES: readonly UserRole[] = ["super_admin", "admin"]

function hasGlobalRole(
  role: UserRole | null | undefined,
  allowedRoles: readonly UserRole[]
): boolean {
  if (!role) {
    return false
  }

  return allowedRoles.includes(role)
}

export function canWriteHomes(role: UserRole | null | undefined): boolean {
  return hasGlobalRole(role, HOME_EMPLOYEE_YOUNG_PEOPLE_WRITE_ROLES)
}

export function canWriteEmployees(role: UserRole | null | undefined): boolean {
  return hasGlobalRole(role, HOME_EMPLOYEE_YOUNG_PEOPLE_WRITE_ROLES)
}

export function canWriteYoungPeople(role: UserRole | null | undefined): boolean {
  return hasGlobalRole(role, HOME_EMPLOYEE_YOUNG_PEOPLE_WRITE_ROLES)
}

export function canWriteVehicles(role: UserRole | null | undefined): boolean {
  return hasGlobalRole(role, VEHICLE_WRITE_ROLES)
}

export function canWriteCareGroups(role: UserRole | null | undefined): boolean {
  return hasGlobalRole(role, CARE_GROUP_WRITE_ROLES)
}

export function canWriteAnnouncements(role: UserRole | null | undefined): boolean {
  return hasGlobalRole(role, ANNOUNCEMENT_WRITE_ROLES)
}

export function canManageAiAccess(
  role: UserRole | null | undefined,
  tenantRole: TenantRole | null | undefined
): boolean {
  return hasGlobalRole(role, AI_ACCESS_GLOBAL_ROLES) || tenantRole === "tenant_admin"
}

export function canManageTenantAdministration(
  role: UserRole | null | undefined,
  tenantRole: TenantRole | null | undefined
): boolean {
  return hasGlobalRole(role, TENANT_ADMINISTRATION_GLOBAL_ROLES) || tenantRole === "tenant_admin"
}

export function getAllowedInviteRoles(
  role: UserRole | null | undefined,
  tenantRole: TenantRole | null | undefined
): TenantRole[] {
  if (role === "super_admin") {
    return ["tenant_admin", "sub_admin", "staff"]
  }

  if (role === "admin" || tenantRole === "tenant_admin") {
    return ["sub_admin", "staff"]
  }

  return []
}

export function canManageInvites(
  role: UserRole | null | undefined,
  tenantRole: TenantRole | null | undefined
): boolean {
  return canManageTenantAdministration(role, tenantRole)
}
