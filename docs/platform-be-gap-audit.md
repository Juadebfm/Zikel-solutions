# Platform FE vs BE Gap Audit (Remaining Pages)

**Prepared on:** April 5, 2026  
**Goal:** Give backend one consolidated list of what is already live vs what still needs BE work.

## Already live (no BE changes needed)

### 1) Homes
- FE is wired to:
  - `GET /api/v1/homes`
  - `GET /api/v1/homes/:id`
  - `POST /api/v1/homes`
  - `PATCH /api/v1/homes/:id`
  - `DELETE /api/v1/homes/:id`
- Current gap is FE-side feature depth (list page is simple), not missing BE endpoints.

### 2) Young People
- FE is wired to:
  - `GET /api/v1/young-people`
  - `GET /api/v1/young-people/:id`
  - `POST /api/v1/young-people`
  - `PATCH /api/v1/young-people/:id`
  - `DELETE /api/v1/young-people/:id`
- No BE contract gap for current page scope.

### 3) Vehicles
- Confirmed live already (see `docs/vehicles-be-gap-![alt text](image.png)brief.md`).
- No additional BE work needed for current FE scope.

### 4) Employees
- Confirmed live already (see `docs/employees-be-gap-brief.md`).
- No additional BE work needed for current FE scope.

## Remaining BE gaps

### A) Care-group relation in Tasks and Events (still blocked)

This remains the main blocker for care-group-linked workflows.

Needed:
- Tasks:
  - support `type: "care_group"` in create/update/list/detail
  - support relation id input (`careGroupId` or stable `relatedEntity` contract)
  - return relation payload with `type: "care_group"` + display name
  - support list filtering by care group
- Events:
  - support `careGroupId` on create/update
  - return `careGroupId` + `careGroupName`
  - support list filtering by care group

Reference: `docs/care-groups-be-gap-brief.md`

### B) Care-group stakeholder management contract

Current FE can read stakeholders from:
- `GET /api/v1/care-groups/:id/stakeholders`

Missing contract for full management:
- `POST /api/v1/care-groups/:id/stakeholders`
- `PATCH /api/v1/care-groups/:id/stakeholders/:stakeholderId`
- `DELETE /api/v1/care-groups/:id/stakeholders/:stakeholderId`

Recommended validation/error codes:
- `CARE_GROUP_NOT_FOUND`
- `STAKEHOLDER_NOT_FOUND`
- `VALIDATION_ERROR`

### C) Rota template application flow

Current FE can:
- list templates (`GET /api/v1/rotas/templates`)
- create templates (`POST /api/v1/rotas/templates`)

Missing backend contract to apply a template into a real rota schedule from UI.

Preferred options (either one is fine):
- `POST /api/v1/rotas/templates/:id/apply`
  - payload example: `{ "homeId": "clx...", "weekStarting": "2026-04-06" }`
- or extend rota create:
  - `POST /api/v1/rotas` with `{ templateId, homeId, weekStarting }`

Recommended errors:
- `ROTA_TEMPLATE_NOT_FOUND`
- `HOME_NOT_FOUND`
- `VALIDATION_ERROR`

## Clarifications to lock once (so FE does not rework)

### 1) Care-group Twilio fields mutability
- FE reads Twilio fields on care-group payloads (`twilioSid`, `twilioToken`, `twilioPhoneNumber`).
- Please confirm if these are writable via `PATCH /care-groups/:id` or intentionally read-only.

### 2) Event relation semantics
- Please confirm final rule set explicitly:
  - home-scoped only
  - or multi-entity (`careGroupId`, `homeId`, etc.) with exclusivity rules
- FE needs this fixed rule to avoid future contract churn.

## FE dependencies blocked by remaining BE gaps

- Create Task/Event directly from Care Group with true relation linkage.
- Stakeholder add/edit/remove in care-group detail flow.
- Apply rota templates from scheduling UI.
