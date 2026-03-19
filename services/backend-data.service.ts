import { apiRequest } from "@/lib/api/client"
import type {
  CareGroup,
  CareGroupHome,
  CareGroupType,
  Employee,
  EmployeeStatus,
  EmpAuditEntry,
  EmpSettingItem,
  HomeAuditEntry,
  HomeSettingItem,
  OutcomeStarEntry,
  Stakeholder,
  TaskExplorerLogEntry,
  Vehicle,
  VehicleAuditEntry,
  VehicleCustomInfoField,
  VehicleSettingItem,
  YoungPerson,
  YoungPersonReward,
  YPAuditEntry,
  YPSettingItem,
} from "@/types"

type JsonRecord = Record<string, unknown>
type QueryParamValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryParamValue>

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as JsonRecord
}

function asRecordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) return []
  return value
    .map(asRecord)
    .filter((item): item is JsonRecord => Boolean(item))
}

function normalizeListData(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return asRecordArray(value)
  }

  const record = asRecord(value)
  if (!record) return []

  const fromItems = asRecordArray(record.items)
  if (fromItems.length > 0) return fromItems

  const fromResults = asRecordArray(record.results)
  if (fromResults.length > 0) return fromResults

  const fromRows = asRecordArray(record.rows)
  if (fromRows.length > 0) return fromRows

  return asRecordArray(record.data)
}

function toIdNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (/^-?\d+$/.test(trimmed)) {
      return Number(trimmed)
    }

    let hash = 0
    for (let i = 0; i < trimmed.length; i += 1) {
      hash = (hash * 31 + trimmed.charCodeAt(i)) >>> 0
    }
    return hash || fallback
  }

  return fallback
}

function pickString(record: JsonRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) {
      return value
    }
  }
  return fallback
}

function pickBoolean(record: JsonRecord, keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "boolean") {
      return value
    }
  }
  return fallback
}

function pickArrayString(record: JsonRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string")
    }
  }
  return []
}

function toStatus(
  raw: string,
  allowed: readonly string[],
  fallback: string
): string {
  if (!raw) return fallback
  const normalized = raw.toLowerCase()
  return allowed.includes(normalized) ? normalized : fallback
}

async function safeList(path: string, query?: QueryParams): Promise<JsonRecord[]> {
  const response = await apiRequest<unknown>({
    path,
    auth: true,
    query,
  })

  return normalizeListData(response.data)
}

async function safeDetail(path: string): Promise<JsonRecord | null> {
  const response = await apiRequest<unknown>({
    path,
    auth: true,
  })

  return asRecord(response.data)
}

function mapCareGroup(record: JsonRecord, index: number): CareGroup {
  const name = pickString(record, ["name", "careGroupName"], `Care Group ${index + 1}`)
  const idSource = record.id ?? record.careGroupId ?? record._id ?? name

  return {
    id: toIdNumber(idSource, index + 1),
    name,
    type: (pickString(record, ["type"], "private").toLowerCase() as CareGroupType) || "private",
    phoneNumber: pickString(record, ["phoneNumber", "phone"]),
    email: pickString(record, ["email"]),
    faxNumber: pickString(record, ["faxNumber", "fax"]),
    description: pickString(record, ["description"]),
    website: pickString(record, ["website"]),
    defaultUserIpRestriction: pickBoolean(record, ["defaultUserIpRestriction"], false),
    homes: pickArrayString(record, ["homes", "homeIds"]),
    manager: pickString(record, ["manager", "managerName"]),
    lastUpdated: pickString(record, ["updatedAt", "lastUpdated", "createdAt"]),
    lastUpdatedBy: pickString(record, ["updatedBy", "lastUpdatedBy", "createdBy"]),
    contact: pickString(record, ["contact"]),
    addressLine1: pickString(record, ["addressLine1"]),
    addressLine2: pickString(record, ["addressLine2"]),
    city: pickString(record, ["city"]),
    countryRegion: pickString(record, ["countryRegion", "country"]),
    postcode: pickString(record, ["postcode", "zipCode"]),
    twilioSid: pickString(record, ["twilioSid"]),
    twilioToken: pickString(record, ["twilioToken"]),
    twilioPhoneNumber: pickString(record, ["twilioPhoneNumber"]),
  }
}

function mapStakeholder(record: JsonRecord, index: number): Stakeholder {
  const idSource = record.id ?? record.stakeholderId ?? record._id ?? index + 1

  return {
    id: toIdNumber(idSource, index + 1),
    name: pickString(record, ["name", "fullName"], "Unknown"),
    position: pickString(record, ["position", "role"], ""),
    responsibleIndividual: pickBoolean(record, ["responsibleIndividual"], false),
    startDate: pickString(record, ["startDate", "createdAt"], ""),
    endDate: pickString(record, ["endDate"], ""),
    userId: pickString(record, ["userId"], ""),
  }
}

function mapHome(record: JsonRecord, index: number): CareGroupHome {
  const name = pickString(record, ["name", "homeName"], `Home ${index + 1}`)
  const idSource = record.id ?? record.homeId ?? record._id ?? name
  const careGroupRecord = asRecord(record.careGroup)
  const careGroupSource =
    record.careGroupId ??
    (typeof record.careGroup === "string" ? record.careGroup : undefined) ??
    careGroupRecord?.id ??
    "0"

  return {
    id: toIdNumber(idSource, index + 1),
    name,
    status: toStatus(
      pickString(record, ["status", "homeStatus"], "current"),
      ["current", "past", "planned"],
      "current"
    ) as CareGroupHome["status"],
    category: pickString(record, ["category", "homeType"], ""),
    responsibleIndividual: pickString(record, ["responsibleIndividual", "managerName", "manager"], ""),
    detailsAvailable: true,
    careGroupId: toIdNumber(careGroupSource, 0),
  }
}

function mapEmployee(record: JsonRecord, index: number): Employee {
  const idSource = record.id ?? record.employeeId ?? record.userId ?? record._id ?? index + 1

  return {
    id: toIdNumber(idSource, index + 1),
    firstName: pickString(record, ["firstName"], ""),
    lastName: pickString(record, ["lastName", "surname"], ""),
    email: pickString(record, ["email"], ""),
    role: (pickString(record, ["role"], "staff").toLowerCase() as Employee["role"]) || "staff",
    homeId: pickString(record, ["homeId"], ""),
    homeName: pickString(record, ["homeName"], ""),
    phone: pickString(record, ["phone", "phoneNumber"], ""),
    jobTitle: pickString(record, ["jobTitle", "position"], ""),
    status: toStatus(
      pickString(record, ["status", "employmentStatus"], "current"),
      ["current", "past", "planned"],
      "current"
    ) as EmployeeStatus,
    startDate: pickString(record, ["startDate", "createdAt"], ""),
    avatar: pickString(record, ["avatar", "avatarUrl"], ""),
  }
}

function mapYoungPerson(record: JsonRecord, index: number): YoungPerson {
  const idSource = record.id ?? record.youngPersonId ?? record._id ?? index + 1

  return {
    id: toIdNumber(idSource, index + 1),
    firstName: pickString(record, ["firstName"], ""),
    lastName: pickString(record, ["lastName", "surname"], ""),
    dateOfBirth: pickString(record, ["dateOfBirth"], ""),
    homeId: pickString(record, ["homeId"], ""),
    homeName: pickString(record, ["homeName"], ""),
    status: toStatus(pickString(record, ["status"], "current"), ["current", "past", "planned"], "current") as YoungPerson["status"],
    youngPersonType: toStatus(
      pickString(record, ["youngPersonType", "type"], "child"),
      ["child", "young-adult"],
      "child"
    ) as YoungPerson["youngPersonType"],
    gender: toStatus(pickString(record, ["gender"], "male"), ["male", "female"], "male") as YoungPerson["gender"],
    category: pickString(record, ["category"], ""),
    avatar: pickString(record, ["avatar", "avatarUrl"], ""),
    admissionDate: pickString(record, ["admissionDate", "createdAt"], ""),
    keyWorker: pickString(record, ["keyWorker", "keyWorkerName"], ""),
  }
}

function mapVehicle(record: JsonRecord, index: number): Vehicle {
  const idSource = record.id ?? record.vehicleId ?? record._id ?? index + 1

  return {
    id: toIdNumber(idSource, index + 1),
    name: pickString(record, ["name"], ""),
    registration: pickString(record, ["registration", "plateNumber"], ""),
    make: pickString(record, ["make"], ""),
    model: pickString(record, ["model"], ""),
    homeId: pickString(record, ["homeId"], ""),
    homeName: pickString(record, ["homeName"], ""),
    status: toStatus(pickString(record, ["status"], "current"), ["current", "past", "planned"], "current") as Vehicle["status"],
    mileage: Number(record.mileage ?? 0) || 0,
    nextServiceDate: pickString(record, ["nextServiceDate"], ""),
    image: pickString(record, ["image", "imageUrl"], ""),
  }
}

function mapSettingBase(record: JsonRecord, index: number, category: string) {
  return {
    id: toIdNumber(record.id ?? record._id ?? index + 1, index + 1),
    name: pickString(record, ["name"], ""),
    systemGenerated: pickBoolean(record, ["systemGenerated"], false),
    hidden: pickBoolean(record, ["hidden"], false),
    createdBy: pickString(record, ["createdBy"], ""),
    createdAt: pickString(record, ["createdAt"], ""),
    updatedOn: pickString(record, ["updatedOn", "updatedAt"], ""),
    updatedBy: pickString(record, ["updatedBy"], ""),
    category,
    sortOrder: Number(record.sortOrder ?? index + 1),
  }
}

function mapAuditBase(record: JsonRecord, index: number, category: string) {
  return {
    id: toIdNumber(record.id ?? record._id ?? index + 1, index + 1),
    event: (pickString(record, ["event"], "Update") as "Update" | "Create" | "Delete"),
    createdBy: pickString(record, ["createdBy"], ""),
    createdAt: pickString(record, ["createdAt"], ""),
    category,
    before: asRecordArray(record.before).map((entry) => ({
      field: pickString(entry, ["field"], ""),
      value: pickString(entry, ["value"], ""),
    })),
    after: asRecordArray(record.after).map((entry) => ({
      field: pickString(entry, ["field"], ""),
      value: pickString(entry, ["value"], ""),
    })),
  }
}

export const backendDataService = {
  async listCareGroups(): Promise<CareGroup[]> {
    const rows = await safeList("/care-groups", {
      page: 1,
      pageSize: 200,
      isActive: true,
    })

    return rows.map(mapCareGroup)
  },

  async getCareGroupById(id: number): Promise<CareGroup | null> {
    const detail = await safeDetail(`/care-groups/${id}`)
    if (detail) {
      return mapCareGroup(detail, 0)
    }

    const groups = await this.listCareGroups()
    return groups.find((group) => group.id === id) ?? null
  },

  async listCareGroupStakeholders(careGroupId: number): Promise<Stakeholder[]> {
    const rows = await safeList(`/care-groups/${careGroupId}/stakeholders`)
    return rows.map(mapStakeholder)
  },

  async listHomes(careGroupId?: number): Promise<CareGroupHome[]> {
    const rows = await safeList("/homes", {
      page: 1,
      pageSize: 500,
      isActive: true,
    })

    const mapped = rows.map(mapHome)

    if (careGroupId === undefined) {
      return mapped
    }

    return mapped.filter((home) => home.careGroupId === careGroupId)
  },

  async listEmployees(): Promise<Employee[]> {
    const rows = await safeList("/employees", {
      page: 1,
      pageSize: 500,
      isActive: true,
    })

    return rows.map(mapEmployee)
  },

  async listYoungPeople(): Promise<YoungPerson[]> {
    const rows = await safeList("/young-people", {
      page: 1,
      pageSize: 500,
      isActive: true,
    })

    return rows.map(mapYoungPerson)
  },

  async listVehicles(): Promise<Vehicle[]> {
    const rows = await safeList("/vehicles", {
      page: 1,
      pageSize: 500,
    })

    return rows.map(mapVehicle)
  },

  async createVehicle(input: Omit<Vehicle, "id">): Promise<Vehicle> {
    const response = await apiRequest<unknown>({
      path: "/vehicles",
      method: "POST",
      auth: true,
      body: input,
    })

    const record = asRecord(response.data)
    if (!record) {
      throw new Error("Invalid vehicle response from server.")
    }

    return mapVehicle(record, 1)
  },

  async listHomeSettings(category: string): Promise<HomeSettingItem[]> {
    const rows = await safeList("/homes/settings", { category })
    return rows.map((row, index) => mapSettingBase(row, index, category) as HomeSettingItem)
  },

  async listHomeAudits(category: string): Promise<HomeAuditEntry[]> {
    const rows = await safeList("/homes/audit", { category })
    return rows.map((row, index) => mapAuditBase(row, index, category) as HomeAuditEntry)
  },

  async listEmployeeSettings(category: string): Promise<EmpSettingItem[]> {
    const rows = await safeList("/employees/settings", { category })
    return rows.map((row, index) => mapSettingBase(row, index, category) as EmpSettingItem)
  },

  async listEmployeeAudits(category: string): Promise<EmpAuditEntry[]> {
    const rows = await safeList("/employees/audit", { category })
    return rows.map((row, index) => mapAuditBase(row, index, category) as EmpAuditEntry)
  },

  async listYPSettings(category: string): Promise<YPSettingItem[]> {
    const rows = await safeList("/young-people/settings", { category })
    return rows.map((row, index) => mapSettingBase(row, index, category) as YPSettingItem)
  },

  async listYPAudits(category: string): Promise<YPAuditEntry[]> {
    const rows = await safeList("/young-people/audit", { category })
    return rows.map((row, index) => mapAuditBase(row, index, category) as YPAuditEntry)
  },

  async listYPRewards(): Promise<YoungPersonReward[]> {
    const rows = await safeList("/young-people/rewards")

    return rows.map((row, index) => ({
      id: toIdNumber(row.id ?? row.rewardId ?? index + 1, index + 1),
      youngPersonName: pickString(row, ["youngPersonName", "youngPerson"], ""),
      rewardType: pickString(row, ["rewardType"], ""),
      points: Number(row.points ?? 0) || 0,
      awardedBy: pickString(row, ["awardedBy"], ""),
      awardedAt: pickString(row, ["awardedAt"], ""),
      status: toStatus(pickString(row, ["status"], "awarded"), ["awarded", "redeemed", "expired"], "awarded") as YoungPersonReward["status"],
    }))
  },

  async listOutcomeStars(): Promise<OutcomeStarEntry[]> {
    const rows = await safeList("/young-people/outcome-stars")

    return rows.map((row, index) => ({
      id: toIdNumber(row.id ?? row.outcomeStarId ?? index + 1, index + 1),
      youngPersonName: pickString(row, ["youngPersonName", "youngPerson"], ""),
      completedBy: pickString(row, ["completedBy"], ""),
      completedAt: pickString(row, ["completedAt"], ""),
      score: Number(row.score ?? 0) || 0,
      status: toStatus(
        pickString(row, ["status"], "pending"),
        ["completed", "in-progress", "pending"],
        "pending"
      ) as OutcomeStarEntry["status"],
    }))
  },

  async listTaskExplorerLogs(): Promise<TaskExplorerLogEntry[]> {
    const rows = await safeList("/tasks/explorer/logs")

    return rows.map((row, index) => ({
      id: pickString(row, ["id"], `log-${index + 1}`),
      taskId: Number(row.taskId ?? index + 1),
      title: pickString(row, ["title"], ""),
      formGroup: pickString(row, ["formGroup"], ""),
      relatesTo: pickString(row, ["relatesTo"], ""),
      relatesToIcon: (pickString(row, ["relatesToIcon"], "home") as "person" | "home"),
      homeOrSchool: pickString(row, ["homeOrSchool"], ""),
      taskDate: pickString(row, ["taskDate"], ""),
      status: (pickString(row, ["status"], "draft") as TaskExplorerLogEntry["status"]),
      originallyRecordedAt: pickString(row, ["originallyRecordedAt", "createdAt"], ""),
      originallyRecordedBy: pickString(row, ["originallyRecordedBy", "createdBy"], ""),
    }))
  },

  async listTaskExplorerFormSubmissions(): Promise<Array<{ name: string; count: number; color: string }>> {
    const rows = await safeList("/tasks/explorer/forms")
    return rows.map((row, index) => ({
      name: pickString(row, ["name"], `Form ${index + 1}`),
      count: Number(row.count ?? 0) || 0,
      color: pickString(row, ["color"], "#f97316"),
    }))
  },

  async listVehicleSettings(category: string): Promise<VehicleSettingItem[]> {
    const rows = await safeList("/vehicles/settings", { category })
    return rows.map((row, index) => mapSettingBase(row, index, category) as VehicleSettingItem)
  },

  async listVehicleCustomInfoFields(): Promise<VehicleCustomInfoField[]> {
    const rows = await safeList("/vehicles/settings/custom-information-fields")

    return rows.map((row, index) => ({
      id: toIdNumber(row.id ?? row._id ?? index + 1, index + 1),
      name: pickString(row, ["name"], ""),
      fieldType: pickString(row, ["fieldType"], "single-line-text-input") as VehicleCustomInfoField["fieldType"],
      heading: pickString(row, ["heading"], ""),
      systemGenerated: pickBoolean(row, ["systemGenerated"], false),
      hidden: pickBoolean(row, ["hidden"], false),
      createdBy: pickString(row, ["createdBy"], ""),
      createdAt: pickString(row, ["createdAt"], ""),
      updatedOn: pickString(row, ["updatedOn", "updatedAt"], ""),
      updatedBy: pickString(row, ["updatedBy"], ""),
      sortOrder: Number(row.sortOrder ?? index + 1),
    }))
  },

  async listVehicleCustomInfoGroups(): Promise<Array<{ id: number; name: string }>> {
    const rows = await safeList("/vehicles/settings/custom-information-groups")
    return rows.map((row, index) => ({
      id: toIdNumber(row.id ?? row._id ?? index + 1, index + 1),
      name: pickString(row, ["name"], `Group ${index + 1}`),
    }))
  },

  async createVehicleCustomInfoField(input: {
    fieldName: string
    description: string
    required: boolean
    customGroup: string
    fieldType: string
    defaultValue: string
  }): Promise<void> {
    await apiRequest({
      path: "/vehicles/settings/custom-information-fields",
      method: "POST",
      auth: true,
      body: input,
    })
  },

  async listVehicleAudits(category: string): Promise<VehicleAuditEntry[]> {
    const rows = await safeList("/vehicles/audit", { category })
    return rows.map((row, index) => mapAuditBase(row, index, category) as VehicleAuditEntry)
  },
}
