# FE Contract (Backend) — Remaining Domains Rollout

**Version date:** April 4, 2026
**Base URL:** `/api/v1`

## Global Rules

- Auth required on all endpoints: `Authorization: Bearer <accessToken>`
- Routes enforce privileged MFA (`requirePrivilegedMfa`)
- Standard success envelope: `{ "success": true, "data": {} }`
- Standard list envelope: `{ "success": true, "data": [], "meta": { "total": 0, "page": 1, "pageSize": 20, "totalPages": 1 } }`
- Standard error envelope: `{ "success": false, "error": { "code": "SOME_CODE", "message": "..." } }`

---

## 1) Documents (with existing Upload flow)

### Existing Uploads
- [x] `POST /uploads/sessions`
- [x] `POST /uploads/:id/complete`
- [x] `GET /uploads/:id/download-url`

### New Documents
- [ ] `GET /documents` — `?page&pageSize&search&category&homeId&uploadedBy&dateFrom&dateTo&sortBy&sortOrder`
- [ ] `GET /documents/:id`
- [ ] `POST /documents` — `{ title, description?, category, fileId, homeId?, visibility?, tags? }`
- [ ] `PATCH /documents/:id` — partial update
- [ ] `DELETE /documents/:id`
- [ ] `GET /documents/categories`

### FE Implementation
- [ ] Create `services/documents.service.ts`
- [ ] Create `hooks/api/use-documents.ts`
- [ ] Add query keys for documents
- [ ] Build Documents page (`/documents`) with Library + Uploads tabs

---

## 2) Reports + Bulk Exports

### Existing Reports
- [x] `GET /reports/reg44-pack` — `?homeId&dateFrom&dateTo&maxEvidenceItems&format(json|pdf|excel|zip)`
- [x] `GET /reports/reg45-pack` — same params
- [x] `GET /reports/ri-dashboard` — `?homeId&careGroupId&dateFrom&dateTo&format(json|pdf|excel)`
- [x] `GET /reports/ri-dashboard/drilldown` — `?metric&homeId&careGroupId&dateFrom&dateTo&page&pageSize&format`

### New Bulk Exports
- [ ] `POST /exports` — `{ entity, filters?, format }`
- [ ] `GET /exports` — `?page&pageSize&status`
- [ ] `GET /exports/:id`
- [ ] `GET /exports/:id/download` — blob/file response

### FE Implementation
- [ ] Create `services/exports.service.ts`
- [ ] Create `hooks/api/use-exports.ts`
- [ ] Add query keys for exports
- [ ] Add Bulk Exports tab to Reports page
- [ ] Wire export buttons across all entity pages (20+ buttons)

---

## 3) Settings

### Existing Personal Settings
- [x] `GET /me/preferences`
- [x] `PATCH /me/preferences`

### New Org Settings
- [ ] `GET /settings/organisation`
- [ ] `PATCH /settings/organisation` — partial `{ name, timezone, locale, dateFormat, logoUrl, notificationDefaults, passwordPolicy, sessionTimeout, mfaRequired, ipRestriction, dataRetentionDays }`
- [ ] `GET /settings/notifications`
- [ ] `PATCH /settings/notifications` — partial `{ emailNotifications, pushNotifications, digestFrequency }`

### FE Implementation
- [ ] Create `services/settings.service.ts`
- [ ] Create `hooks/api/use-settings.ts`
- [ ] Add query keys for settings
- [ ] Build Settings page (`/settings`) with Personal + Organisation tabs

---

## 4) Scheduling

### Calendar
- [ ] `GET /calendar/events` — `?homeId&dateFrom&dateTo&type&page&pageSize`
- [ ] `GET /calendar/events/:id`
- [ ] `POST /calendar/events` — `{ title, description?, type, startAt, endAt, homeId?, attendeeIds?, recurrence?, allDay? }`
- [ ] `PATCH /calendar/events/:id`
- [ ] `DELETE /calendar/events/:id`

### Rotas
- [ ] `GET /rotas` — `?homeId&weekStarting&employeeId&page&pageSize`
- [ ] `GET /rotas/:id`
- [ ] `POST /rotas` — `{ homeId, weekStarting, shifts: [{ employeeId, dayOfWeek, startTime, endTime, role }] }`
- [ ] `PATCH /rotas/:id`
- [ ] `DELETE /rotas/:id`
- [ ] `GET /rotas/templates`
- [ ] `POST /rotas/templates` — `{ name, homeId, shifts: [...] }`

### FE Implementation
- [ ] Create `services/scheduling.service.ts`
- [ ] Create `hooks/api/use-scheduling.ts`
- [ ] Add query keys for scheduling
- [ ] Build Scheduling page (`/scheduling`) with Calendar + Rotas tabs
- [ ] Add nav item for Scheduling

---

## 5) Organisation

### Existing Care Groups
- [x] `GET /care-groups`
- [x] `GET /care-groups/:id`
- [x] `POST /care-groups`
- [x] `PATCH /care-groups/:id`
- [x] `DELETE /care-groups/:id`

### New Regions
- [ ] `GET /regions` — `?page&pageSize&search&isActive`
- [ ] `GET /regions/:id`
- [ ] `POST /regions` — `{ name, description, homeIds }`
- [ ] `PATCH /regions/:id`
- [ ] `DELETE /regions/:id`

### New Groupings
- [ ] `GET /groupings` — `?page&pageSize&search&type&isActive`
- [ ] `GET /groupings/:id`
- [ ] `POST /groupings` — `{ name, description, type, entityIds, entityType }`
- [ ] `PATCH /groupings/:id`
- [ ] `DELETE /groupings/:id`

### FE Implementation
- [ ] Create `services/organisation.service.ts`
- [ ] Create `hooks/api/use-organisation.ts`
- [ ] Add query keys for organisation
- [ ] Build Organisation page (`/organisation`) with Regions + Groupings tabs
- [ ] Add nav item for Organisation

---

## 6) Sensitive Data

### Endpoints
- [ ] `GET /sensitive-data` — `?page&pageSize&search&category&youngPersonId&homeId&confidentialityScope&dateFrom&dateTo&sortBy&sortOrder`
- [ ] `GET /sensitive-data/:id` — elevated access check
- [ ] `POST /sensitive-data` — `{ title, category, content, youngPersonId?, homeId?, confidentialityScope, retentionDate?, attachmentFileIds? }`
- [ ] `PATCH /sensitive-data/:id`
- [ ] `DELETE /sensitive-data/:id` — soft delete + audit trail
- [ ] `GET /sensitive-data/categories`
- [ ] `GET /sensitive-data/:id/access-log`

### FE Implementation
- [ ] Create `services/sensitive-data.service.ts`
- [ ] Create `hooks/api/use-sensitive-data.ts`
- [ ] Add query keys for sensitive data
- [ ] Build Sensitive Data page (`/sensitive-data`)
- [ ] Unhide nav item for Sensitive Data

---

## Critical Enums (FE must match exactly)

| Domain | Field | Values |
|--------|-------|--------|
| Exports | `entity` | `homes`, `employees`, `young_people`, `vehicles`, `care_groups`, `tasks`, `daily_logs`, `audit` |
| Exports | `format` | `pdf`, `excel`, `csv` |
| Calendar | `type` | `shift`, `appointment`, `meeting`, `deadline`, `other` |
| Groupings | `type` | `operational`, `reporting`, `custom` |
| Groupings | `entityType` | `home`, `employee`, `care_group` |
| Sensitive Data | `confidentialityScope` | `restricted`, `confidential`, `highly_confidential` |
| Settings | `digestFrequency` | `off`, `daily`, `weekly`, `monthly` |
