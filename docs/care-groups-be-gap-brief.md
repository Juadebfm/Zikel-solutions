# Care Groups: FE vs BE Gap Brief

**Prepared on:** April 5, 2026  
**Scope:** Care-group management + linking tasks/events to a specific care group.

## What FE now supports

- Care group list page now shows full care-group details (contact, address, status, timestamps, homes, Twilio non-secret fields).
- Care group creation is now wired through `POST /care-groups` with required and optional fields.

## Backend gaps for “task/event related to care group”

### 1) Tasks need explicit care-group relation support

Current FE task models support related types:
- `home`
- `young_person`
- `vehicle`
- `employee`
- `document`
- `event`

Missing for care groups:
- Add `care_group` as a supported task entity type in task create/update/list/detail contracts.
- Accept a relation identifier for care group on create/update (prefer one stable contract, e.g. `careGroupId` or `relatedEntity: { type, id }`).
- Return `relatedEntity.type = "care_group"` and `relatedEntity.name` in list/detail responses.
- Allow filtering tasks by care group in list endpoints.

### 2) Calendar/events need care-group relation fields

Current FE event payloads and responses are home-based (`homeId`, `homeName`) with no care-group key.

Missing:
- Support `careGroupId` on event create/update.
- Return `careGroupId` and display-friendly `careGroupName` in event list/detail.
- Support event filtering by care group in list endpoint.

### 3) Validation/error contract needed for both domains

Please provide explicit error codes for:
- invalid/non-tenant `careGroupId`
- unsupported relation type
- relation mismatch (if both `homeId` and `careGroupId` are disallowed together)

Recommended codes:
- `CARE_GROUP_NOT_FOUND`
- `INVALID_RELATION_TYPE`
- `INVALID_RELATION_TARGET`
- `VALIDATION_ERROR`

## Suggested contract examples

### Task create (example)

```json
{
  "title": "Care Group audit prep",
  "type": "care_group",
  "category": "task_log",
  "priority": "medium",
  "careGroupId": "clx_cg_123"
}
```

### Event create (example)

```json
{
  "title": "Care Group risk review",
  "type": "meeting",
  "startAt": "2026-04-08T10:00:00.000Z",
  "endAt": "2026-04-08T11:00:00.000Z",
  "careGroupId": "clx_cg_123"
}
```

## FE dependencies blocked by these gaps

- “Create Task/Event from Care Group” action with proper entity linkage.
- Filtering task/event lists by care group.
- Accurate rendering of care-group-linked tasks/events in tables and detail views.
