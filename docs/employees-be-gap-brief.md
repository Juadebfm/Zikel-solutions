# Employees: BE Confirmation (Ready For FE Wiring)

**Confirmed on:** April 5, 2026  
**Status:** No backend changes needed for current employee scope.

## Available endpoints

- `GET /api/v1/employees`  
  Supports pagination + filters: `homeId`, `status`, `roleId`, `search`, `isActive`.
- `GET /api/v1/employees/:id`  
  Includes nested `user` object (`firstName`, `lastName`, `email`).
- `POST /api/v1/employees`  
  Link an existing user as an employee.
- `POST /api/v1/employees/create-with-user`  
  Create user + employee + membership atomically.
- `PATCH /api/v1/employees/:id`
- `DELETE /api/v1/employees/:id` (soft deactivate)
- `GET /api/v1/employees/export?format=pdf|excel`

## Task relation contract (employee)

Two supported patterns:

1. `assigneeId: "{employeeId}"`  
   Use when the employee is responsible for completing the task.

2. `type: "employee"` + `relatedEntityId: "{employeeId}"`  
   Use when the task is about or references a specific employee.

## Event relation contract (employee)

- Employee participation in events uses `attendeeIds`.
- `attendeeIds` must contain **User IDs** (not Employee IDs).

Example:

```json
{
  "title": "Staff supervision meeting",
  "type": "meeting",
  "startAt": "2026-04-11T14:00:00.000Z",
  "endAt": "2026-04-11T15:00:00.000Z",
  "attendeeIds": ["clx_user_1", "clx_user_2"]
}
```

## Create employee payloads

### Link existing user

```json
{
  "userId": "clx_user_id",
  "homeId": "clx_home_id",
  "roleId": "clx_role_id",
  "jobTitle": "Senior Carer",
  "startDate": "2026-01-15T00:00:00.000Z",
  "contractType": "Full-time"
}
```

### Create with new user (full onboarding)

```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@zikel.dev",
  "password": "SecurePass123!",
  "homeId": "clx_home_id",
  "roleId": "clx_role_id",
  "jobTitle": "Night Shift Carer",
  "startDate": "2026-04-10T00:00:00.000Z",
  "contractType": "Full-time",
  "userType": "internal"
}
```

## Not supported (by design)

- There is no separate “employee-as-event-entity” field.
- Use `attendeeIds` for event participation.
- If workflow needs explicit employee relation semantics, use Tasks with `type: "employee"` + `relatedEntityId`.

## FE implementation note

- FE can proceed immediately with full employees wiring.
