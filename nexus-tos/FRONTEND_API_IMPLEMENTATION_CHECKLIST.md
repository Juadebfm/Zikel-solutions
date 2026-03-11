# Frontend API Implementation Guide + Checklist (Live Backend)

This document is the frontend integration source of truth for the **currently registered backend routes**.
Use this checklist during implementation and mark each item as complete by changing `[ ]` to `[x]`.

## Progress Tracker

- Last updated: `2026-03-11`
- Checklist convention:
  - `[ ]` not implemented
  - `[x]` implemented and verified

## 0) State Management Convention (Important)

This frontend uses **TanStack Query + Zustand**.

- TanStack Query: all server state (fetching, caching, invalidation, loading/error state for API resources)
- Zustand: client-only state (auth session, UI toggles, wizards, form drafts, filters not persisted by backend)
- Rule: do not duplicate the same server resource in both Query cache and Zustand store

## 1) Base URL and Prefix

- Base URL (production): `https://zikel-solutions-be.onrender.com`
- API prefix: `/api/v1`
- Full API base: `https://zikel-solutions-be.onrender.com/api/v1`

Infrastructure endpoints (no `/api/v1` prefix):
- `GET /health`
- `GET /ready`

## 2) Headers

Public endpoints:
- `Content-Type: application/json`

Protected endpoints:
- `Content-Type: application/json`
- `Authorization: Bearer <accessToken>`

Optional:
- `x-request-id: <uuid>` (backend generates one if omitted)

## 3) Response Envelope

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Notes:
- `meta` appears only on paginated endpoints.
- FE should parse errors from `error.code` and `error.message`.

## 4) Auth and Token Flow

- Access token expiry: `JWT_ACCESS_EXPIRY` (default `15m`)
- Refresh token expiry: `JWT_REFRESH_EXPIRY` (default `7d`)
- Refresh token rotation is enforced.

Recommended FE behavior:
1. Store both `accessToken` and `refreshToken` on login/verify-otp/refresh.
2. On `401` from protected endpoints, attempt one refresh.
3. If refresh succeeds, retry original request once.
4. If refresh fails, clear session and redirect to login.

## 5) Error and Status Handling

Common statuses:
- `200` OK
- `201` Created
- `401` Invalid/missing auth or expired/invalid token
- `403` Authenticated but not allowed (RBAC)
- `404` Resource not found
- `409` Conflict/state error
- `422` Validation error
- `429` Rate limit/cooldown

Common codes:
- `VALIDATION_ERROR`
- `FORBIDDEN`
- `RATE_LIMIT_EXCEEDED`
- module-specific codes like `OTP_INVALID`, `EMAIL_TAKEN`

---

## 6) Frontend Implementation Checklist

All routes below are relative to `/api/v1` unless otherwise stated.

### 6.0 Foundation

- [x] Add env config for API base URL.
- [x] Build shared HTTP client wrapper (used by TanStack Query query/mutation functions).
- [x] Implement `ApiSuccess<T>`, `ApiError`, and response narrowing.
- [x] Add Query Key factory for all modules (`auth`, `me`, `summary`, etc.).
- [x] Confirm `QueryProvider` is mounted once at app root layout.
- [x] Create/extend Zustand auth/session store for `accessToken`, `refreshToken`, current user, and clear-session action.
- [x] Keep API resource lists/details in TanStack Query cache, not in Zustand stores.
- [x] Use Zustand only for client workflow state (steppers, modal flags, local filters, transient drafts).
- [x] Add auth header injection for protected calls.
- [x] Implement centralized `401 -> refresh -> single retry` interceptor flow.
- [x] Enforce refresh token rotation in storage after `/auth/refresh`.
- [x] Add unified error handling by `error.code` + `error.message`.
- [x] Add optional `x-request-id` forwarding support.

### 6.1 Auth (public unless marked protected)

- [x] `POST /auth/register`
- [x] `GET /auth/check-email?email=`
- [x] `POST /auth/verify-otp` (support both body formats)
- [x] `POST /auth/resend-otp` (support both body formats)
- [x] `POST /auth/login`
- [x] `POST /auth/refresh` (support `refreshToken` and legacy `token`)
- [x] `POST /auth/logout` (protected)
- [x] `POST /auth/forgot-password`
- [x] `POST /auth/reset-password`
- [x] `GET /auth/me` (protected)

### 6.2 Me (all protected)

- [x] `GET /me`
- [x] `PATCH /me`
- [x] `POST /me/change-password`
- [x] `GET /me/permissions`
- [x] `GET /me/preferences`
- [x] `PATCH /me/preferences`

### 6.3 Public (no auth, each endpoint rate-limited `10 requests / 10 minutes / IP`)

- Important enum update: `serviceOfInterest` now uses `care_documentation_platform` for documentation/demo flows.
- Deprecated legacy enum values are removed and now return `422 VALIDATION_ERROR`.
- [ ] `POST /public/book-demo`
- [ ] `POST /public/join-waitlist`
- [ ] `POST /public/contact-us`
- [ ] Enforce FE enum for `serviceOfInterest`:
  - `care_documentation_platform`
  - `ai_staff_guidance`
  - `training_development`
  - `healthcare_workflow`
  - `general_enquiry`

### 6.4 Announcements (all protected)

- [x] `GET /announcements?status=read|unread&page=1&limit=20`
- [x] `GET /announcements/:id` (marks as read)
- [ ] `POST /announcements/:id/read`
- [ ] `POST /announcements` (admin only)
- [ ] `PATCH /announcements/:id` (admin only)
- [ ] `DELETE /announcements/:id` (admin only)

### 6.5 Summary (all protected)

- [x] `GET /summary/stats`
- [x] `GET /summary/todos?page=1&pageSize=20&sortBy=dueDate&sortOrder=asc&search=`
- [x] `GET /summary/tasks-to-approve?page=1&pageSize=20` (manager/admin)
- [x] `POST /summary/tasks-to-approve/process-batch`
- [x] `POST /summary/tasks-to-approve/:id/approve`
- [x] `GET /summary/provisions`

### 6.6 Dashboard (all protected)

- [x] `GET /dashboard/stats`
- [x] `GET /dashboard/widgets`
- [x] `POST /dashboard/widgets`
- [x] `DELETE /dashboard/widgets/:id`

### 6.7 Care Groups (all protected)

- [ ] `GET /care-groups?page=1&pageSize=20&search=&isActive=true`
- [ ] `GET /care-groups/:id`
- [ ] `POST /care-groups` (admin only)
- [ ] `PATCH /care-groups/:id` (admin only)
- [ ] `DELETE /care-groups/:id` (admin only, soft delete)

### 6.8 Homes (all protected)

- [ ] `GET /homes?page=1&pageSize=20&search=&careGroupId=&isActive=true`
- [ ] `GET /homes/:id`
- [ ] `POST /homes` (admin/manager)
- [ ] `PATCH /homes/:id` (admin/manager)
- [ ] `DELETE /homes/:id` (admin/manager, soft delete)

### 6.9 Employees (all protected)

- [ ] `GET /employees?page=1&pageSize=20&search=&homeId=&isActive=true`
- [ ] `GET /employees/:id`
- [ ] `POST /employees` (admin/manager)
- [ ] `PATCH /employees/:id` (admin/manager)
- [ ] `DELETE /employees/:id` (admin/manager, soft delete)

### 6.10 Young People (all protected)

- [ ] `GET /young-people?page=1&pageSize=20&search=&homeId=&isActive=true`
- [ ] `GET /young-people/:id`
- [ ] `POST /young-people` (admin/manager)
- [ ] `PATCH /young-people/:id` (admin/manager)
- [ ] `DELETE /young-people/:id` (admin/manager, soft delete)

---

## 7) FE Do and Don't

### Do

- [x] Use `Authorization: Bearer <accessToken>` on all protected routes.
- [x] Implement single-refresh retry logic on `401`.
- [x] Use TanStack Query hooks for API reads/writes and invalidate related keys after mutations.
- [x] Use Zustand for local UI/workflow state only.
- [x] Use `pageSize` on most list endpoints.
- [x] Use `limit` (not `pageSize`) on `/announcements`.
- [ ] Send ISO date-time where required (e.g. employee `startDate`).
- [ ] Send `YYYY-MM-DD` for young person `dateOfBirth`.
- [ ] Send `serviceOfInterest: "care_documentation_platform"` for digital documentation/demo use cases.
- [ ] Treat `403` as authorization (not token expiry).
- [x] Show backend validation messages for `422`.
- [ ] Treat many delete endpoints as soft-delete (record becomes inactive).

### Don't

- [x] Do not call endpoints listed in `needed.md` that are not implemented in the live backend.
- [ ] Do not send unexpected/extra fields (`additionalProperties: false` on many bodies).
- [x] Do not continue using an old refresh token after `/auth/refresh` success.
- [x] Do not store server lists/details in Zustand when TanStack Query cache should be the source of truth.
- [ ] Do not send deprecated `serviceOfInterest` values.
- [x] Do not assume `/announcements/:id` is read-only (it marks as read).
- [ ] Do not rely on public endpoint email delivery status for success.

---

## 8) Shared FE Types (Suggested)

```ts
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export type ApiError = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

## 9) Live Route Scope

Implemented backend modules right now:
- auth
- me
- public
- announcements
- summary
- dashboard
- care-groups
- homes
- employees
- young-people

Not registered yet (planned, not live):
- vehicles
- tasks
- audit
- other future modules
