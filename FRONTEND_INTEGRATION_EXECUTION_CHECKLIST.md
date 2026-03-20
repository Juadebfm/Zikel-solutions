# Frontend Integration Execution Checklist (Backend-Verified)

Last updated: 2026-03-19
Spec source: backend handoff shared on 2026-03-19.

## Execution Protocol (One Item at a Time)

1. Work strictly in checklist order.
2. Keep exactly one item marked `[-] IN PROGRESS`.
3. Mark `[x] DONE` only after code changes, QA checks, and evidence are recorded.
4. If blocked, mark `[!] BLOCKED` and record blocker + owner.
5. Do not start the next item until the current in-progress item is done or blocked.

Status legend:
- `[ ]` Not started
- `[-]` In progress
- `[x]` Done
- `[!]` Blocked

## Master Checklist (Ordered)

### Phase 1: Auth and Onboarding Contract Parity

- `[x] C01` Registration form includes `organizationName` (required) and optional `organizationSlug`, and sends both to `POST /api/v1/auth/register`.
- `[x] C02` Remove post-OTP "create organization" step for owner signup. Verified owner should land in dashboard with active tenant.
- `[x] C03` Treat owner registration + OTP verify as already tenant-linked. No homeless-user branch for this path.
- `[x] C04` Implement staff activation flow page (`/activate`) using `POST /api/v1/auth/staff-activate`.
- `[x] C05` Implement invite-link join flow page (`/join/:code`) using `GET /api/v1/auth/join/:inviteCode` and `POST /api/v1/auth/join/:inviteCode`.
- `[x] C06` Implement pending approval UX and dashboard blocking for `membership.status = pending_approval`.

### Phase 2: Tenant, Membership, and Role UX

- `[x] C07` Users page supports membership statuses (`active`, `invited`, `pending_approval`, `suspended`, `revoked`) with approval actions.
- `[x] C08` Tenant switcher UX for multi-membership users using `POST /api/v1/auth/switch-tenant`.
- `[x] C09` Align role and permission gating to backend matrix (global role + tenant role).

### Phase 3: Staff Provisioning and Invite Links

- `[x] C10` Implement admin staff provisioning (`POST /api/v1/tenants/:tenantId/staff`) with invited-state handling.
- `[x] C11` Implement invite-link generation/list/revoke (`POST|GET|PATCH /api/v1/tenants/:tenantId/invite-link(s)`).
- `[x] C12` Verify token invite lifecycle behavior (`GET|POST|PATCH /api/v1/tenants/:tenantId/invites*` and `POST /api/v1/tenants/invites/accept`).

### Phase 4: Security and Session Infrastructure

- `[x] C13` Persist full auth session context (`user`, `session`, `activeTenantId`, `activeTenantRole`, `memberships`, `mfaRequired`, `mfaVerified`, tokens).
- `[x] C14` Enforce refresh-token rotation flow: one refresh attempt per first `401`, replace both tokens, single retry, logout on `REFRESH_TOKEN_INVALID`.
- `[x] C15` Enforce privileged MFA flow (`challenge -> verify -> retry`) for `super_admin` and `tenant_admin`.
- `[x] C16` Keep public auth submit flows free of third-party challenge dependencies.
- `[x] C17` Standardize frontend handling for `400 FST_ERR_VALIDATION`, `422 VALIDATION_ERROR`, and `429 RATE_LIMIT_EXCEEDED`.

### Phase 5: App Surface and Contract Validation

- `[x] C18` Validate endpoint and UX parity for users, invite management, audit/security alerts, and task approval restrictions.
- `[x] C19` Implement tenant-isolation-safe UX for ambiguous `404` responses (not found vs not accessible in current tenant).
- `[x] C20` Confirm all required FE pages/routes exist and match contract:
  - Public: registration, OTP verify, login, forgot password, reset password, `/activate`, `/join/:code`, pending-approval.
  - Authenticated: MFA page/modal, users page with status filters and approval controls, tenant switcher.

## Endpoint-Specific Must-Have Checks

- `[x] E01` `POST /api/v1/auth/register` request body includes `organizationName`; handles `ORG_SLUG_TAKEN`.
- `[x] E02` `POST /api/v1/auth/staff-activate` flow stores full AuthResponse and routes correctly.
- `[x] E03` `GET|POST /api/v1/auth/join/:inviteCode` supports invalid/revoked/expired link errors.
- `[x] E04` `POST /api/v1/auth/verify-otp` handles owner-login success vs pending approval outcomes.
- `[x] E05` `POST /api/v1/tenants/:id/staff` and membership APIs support invited + pending_approval lifecycle.
- `[x] E06` `POST /api/v1/tenants/:id/invite-link` and list/revoke flows support sharing UX (`https://app.zikel.com/join/{code}`).

## Error Playbook Checks

- `[x] ER01` Auth: `EMAIL_TAKEN`, `ORG_SLUG_TAKEN`, `OTP_INVALID`, `OTP_COOLDOWN`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`.
- `[x] ER02` Session: `REFRESH_TOKEN_INVALID`, `TENANT_CONTEXT_REQUIRED`, `TENANT_ACCESS_DENIED`, `MFA_REQUIRED`, `MFA_NOT_REQUIRED`.
- `[x] ER03` Activation and invite-link: `ACTIVATION_INVALID`, `ALREADY_ACTIVATED`, `INVITE_LINK_NOT_FOUND`, `INVITE_LINK_REVOKED`, `INVITE_LINK_EXPIRED`, `TENANT_INACTIVE`.
- `[x] ER04` Tenant and invite: `TENANT_MEMBERSHIP_EXISTS`, `TENANT_MEMBERSHIP_FORBIDDEN`, `TENANT_INVITE_*`.
- `[x] ER05` Generic: `FST_ERR_VALIDATION`, `VALIDATION_ERROR`, `RATE_LIMIT_EXCEEDED`.

## Rate-Limit UX Checks

- `[x] RL01` Show retry guidance and cooldown UX for auth endpoints with strict limits (`register`, `verify-otp`, `resend-otp`, `login`, `forgot-password`, `reset-password`).
- `[x] RL02` Apply safe throttling UX for `staff-activate`, `join/:inviteCode`, `tenants/:id/staff`, and `ai/ask`.

## Evidence Log Template (Copy per Item)

Use this template when completing each item:

```md
### CXX - <item title>
- Status: [ ] / [-] / [x] / [!] 
- Date:
- Owner:
- Files changed:
- API endpoints touched:
- QA evidence (manual + automated):
- Risks or follow-up:
```

### C01 - Registration org fields
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `types/auth.ts`
  - `lib/validators.ts`
  - `components/auth/signup/step-basic-info.tsx`
  - `components/auth/signup/signup-form.tsx`
  - `services/auth.service.ts`
  - `i18n/en.json`
  - `i18n/fr.json`
- API endpoints touched:
  - `POST /api/v1/auth/register`
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - Step 2 still collects legacy fields (`gender`, `phone`) not yet removed from UX.

### C02 - Remove create-organization post-OTP redirect
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `contexts/auth-context.tsx`
  - `app/page.tsx`
- API endpoints touched:
  - Routing behavior only (no endpoint payload changes)
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - Existing `/onboarding/create-organization` page still exists but is no longer used by auth redirects.

### C03 - Owner OTP requires tenant-linked session
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `components/auth/signup/signup-form.tsx`
- API endpoints touched:
  - `POST /api/v1/auth/verify-otp`
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - This guard is currently scoped to owner signup flow and does not yet handle join-link pending approval UX.

### C04 - Staff activation page and endpoint wiring
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `app/(auth)/activate/page.tsx`
  - `services/auth.service.ts`
  - `contexts/auth-context.tsx`
- API endpoints touched:
  - `POST /api/v1/auth/staff-activate`
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - Activation code is currently validated as 6 digits based on current backend spec; adjust if backend changes format.

### C05 - Join via invite link page
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `app/(auth)/join/[code]/page.tsx`
  - `services/auth.service.ts`
  - `contexts/auth-context.tsx`
- API endpoints touched:
  - `GET /api/v1/auth/join/:inviteCode`
  - `POST /api/v1/auth/join/:inviteCode`
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - Join completion currently routes through the existing `/verify-email` page, with pending-approval handling deferred until post-OTP session hydration.

### C06 - Pending approval blocking UX
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `app/(auth)/pending-approval/page.tsx`
  - `contexts/auth-context.tsx`
  - `types/auth.ts`
  - `types/index.ts`
  - `services/auth.service.ts`
- API endpoints touched:
  - Session handling logic for auth responses (no direct new endpoint)
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - Assumes backend includes `membership.status` in auth session responses; if absent, fallback remains `isActive`.

### C07 - Users membership status management
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `services/tenants.service.ts`
  - `hooks/api/use-tenants.ts`
  - `lib/query-keys.ts`
  - `app/(dashboard)/users/page.tsx`
- API endpoints touched:
  - `GET /api/v1/tenants/:id/memberships`
  - `PATCH /api/v1/tenants/:id/memberships/:membershipId`
- QA evidence (manual + automated):
  - Lint passed for touched files.
- Risks or follow-up:
  - FE currently uses invite-management capability gate for approve action until dedicated membership permission signals are exposed.

### C08 - Tenant switcher UX verification
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - None (existing implementation verified)
- API endpoints touched:
  - `POST /api/v1/auth/switch-tenant` (existing wiring confirmed)
- QA evidence (manual + automated):
  - Verified desktop sidebar switcher uses session memberships and `switchTenant`.
- Risks or follow-up:
  - Mobile navigation currently does not expose a tenant switch control.

### C09 - Role and tenant-role gate alignment
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `lib/auth/rbac.ts`
  - `app/(dashboard)/users/page.tsx`
  - `components/layout/sidebar.tsx`
  - `components/layout/mobile-nav.tsx`
- API endpoints touched:
  - Tenant user-management gate coverage for:
    - `POST /api/v1/tenants/:id/staff`
    - `POST|GET|PATCH /api/v1/tenants/:id/invite-link(s)`
    - `GET|PATCH /api/v1/tenants/:id/memberships*`
- QA evidence (manual + automated):
  - Lint passed for all touched files.
  - Gate logic now allows tenant administration for `super_admin`, `admin`, and `tenant_admin` only.
- Risks or follow-up:
  - Fine-grained per-action capability signals from backend are still preferred over role inference for long-term parity.

### C10 - Admin staff provisioning flow
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `services/tenants.service.ts`
  - `hooks/api/use-tenants.ts`
  - `app/(dashboard)/users/page.tsx`
- API endpoints touched:
  - `POST /api/v1/tenants/:tenantId/staff`
  - `GET /api/v1/tenants/:tenantId/memberships`
- QA evidence (manual + automated):
  - Lint passed for touched files.
  - Users page now provisions staff with `firstName`, `lastName`, `email`, `role` and surfaces invited-state success feedback.
- Risks or follow-up:
  - Final role options are FE-gated to `staff`/`sub_admin`; backend remains source of truth for enforcement.

### C11 - Invite-link generation/list/revoke
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `services/tenants.service.ts`
  - `hooks/api/use-tenants.ts`
  - `lib/query-keys.ts`
  - `app/(dashboard)/users/page.tsx`
- API endpoints touched:
  - `POST /api/v1/tenants/:tenantId/invite-link`
  - `GET /api/v1/tenants/:tenantId/invite-links`
  - `PATCH /api/v1/tenants/:tenantId/invite-links/:linkId/revoke`
- QA evidence (manual + automated):
  - Lint passed for touched files.
  - Users page includes invite-link generator, invite-link table, revoke action, and copyable `.../join/{code}` share URL.
- Risks or follow-up:
  - `NEXT_PUBLIC_APP_URL` should be configured in each environment for exact share-domain output.

### C12 - Token invite lifecycle verification
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - None (behavior verified against current implementation)
- API endpoints touched:
  - `GET /api/v1/tenants/:id/invites`
  - `POST /api/v1/tenants/:id/invites`
  - `PATCH /api/v1/tenants/:id/invites/:inviteId/revoke`
  - `POST /api/v1/tenants/invites/accept`
- QA evidence (manual + automated):
  - Existing Users page invite table + create/revoke actions confirmed.
  - Existing accept page confirmed at `app/(dashboard)/invites/accept/page.tsx` with token input and tenant switch on success.
- Risks or follow-up:
  - Error-code specific UX for `TENANT_INVITE_*` variants is tracked in later error-playbook items.

### C13 - Full auth session context persistence
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `types/auth.ts`
  - `services/auth.service.ts`
  - `lib/api/client.ts`
- API endpoints touched:
  - Auth session consumers for:
    - `POST /api/v1/auth/login`
    - `POST /api/v1/auth/verify-otp`
    - `POST /api/v1/auth/refresh`
    - `POST /api/v1/auth/switch-tenant`
- QA evidence (manual + automated):
  - Lint passed for touched files.
  - Session membership mapping now preserves `status`, `tenantName`, and `tenantSlug` during both login-time and refresh-time hydration.
- Risks or follow-up:
  - Any new backend session fields should be added to typed mappers to avoid silent drop.

### C14 - Refresh-token rotation enforcement
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - None (existing behavior verified)
- API endpoints touched:
  - `POST /api/v1/auth/refresh`
- QA evidence (manual + automated):
  - Verified in `lib/api/client.ts`: first protected `401` triggers one refresh attempt, replaces both tokens, retries original request once, and clears session on `REFRESH_TOKEN_INVALID`.
- Risks or follow-up:
  - Optional follow-up: add integration tests around refresh race conditions and retry boundaries.

### C15 - Privileged MFA enforcement
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - None (existing behavior verified)
- API endpoints touched:
  - `POST /api/v1/auth/mfa/challenge`
  - `POST /api/v1/auth/mfa/verify`
- QA evidence (manual + automated):
  - Verified `MFA_REQUIRED` interception in `lib/api/client.ts` stores pending request and updates session MFA flags.
  - Verified `app/(auth)/mfa-verify/page.tsx` + `contexts/auth-context.tsx` run challenge -> verify, replace access token, and retry pending request once.
- Risks or follow-up:
  - Optional follow-up: explicitly surface `MFA_NOT_REQUIRED` as an informational state in UI.

### C16 - Public auth free of challenge dependencies
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - None (confirmed post-removal state)
- API endpoints touched:
  - Public auth submit surfaces broadly (no challenge headers injected)
- QA evidence (manual + automated):
  - Repository grep for `captcha|turnstile|x-captcha-token|CAPTCHA_` returned no matches.
- Risks or follow-up:
  - If backend later reintroduces challenge requirements, this checklist item must be reopened.

### C17 - Standardized 400/422/429 handling
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `lib/api/error.ts`
  - `lib/auth/otp.ts`
- API endpoints touched:
  - Shared error handling across auth + tenant + domain forms (all API calls using shared helpers)
- QA evidence (manual + automated):
  - Lint passed for touched files.
  - `getApiErrorMessage` now normalizes validation (`400/422`) and rate-limit (`429`) responses, including retry-after messaging.
  - Public auth helper now composes shared error formatting while preserving password-specific friendly mappings.
- Risks or follow-up:
  - FE can still add field-level parsing for richer inline validation where backend details include structured field paths.

### C18 - Endpoint and UX parity validation (users/invites/audit/task approvals)
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `app/(dashboard)/my-summary/page.tsx`
- API endpoints touched:
  - Users + invite management endpoints validated in prior items (`/tenants/:id/staff`, `/invite-link(s)`, `/invites*`)
  - Audit endpoints verified against implemented screen (`GET /api/v1/audit`, `GET /api/v1/audit/security-alerts`, `GET /api/v1/audit/:id`)
  - Task approval endpoints:
    - `POST /api/v1/summary/tasks-to-approve/process-batch`
    - `POST /api/v1/summary/tasks-to-approve/:id/approve`
- QA evidence (manual + automated):
  - Lint passed for `app/(dashboard)/my-summary/page.tsx`.
  - Added explicit success/error feedback for single and batch task approval actions, including restriction-friendly error mapping (`TASK_APPROVAL_STATE_FORBIDDEN`, `TASK_ASSIGN_FORBIDDEN`, `INVALID_TASK_STATE`).
- Risks or follow-up:
  - Backend capability flags for approval operations would further reduce FE role-based assumptions.

### C19 - Tenant-isolation-safe 404 UX
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `lib/api/error.ts`
- API endpoints touched:
  - All tenant-scoped consumers that render shared API error messages
- QA evidence (manual + automated):
  - Lint passed for touched file.
  - Shared error helper now converts `404` responses to tenant-safe copy: "not found or not accessible in your current tenant."
- Risks or follow-up:
  - Optional future enhancement: route-specific 404 copy for finer context while preserving isolation semantics.

### C20 - Required page/route contract confirmation
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `app/(dashboard)/onboarding/create-organization/page.tsx`
- API endpoints touched:
  - Route alignment only (no payload changes)
- QA evidence (manual + automated):
  - Confirmed required public routes exist: register, verify-email (OTP), login, forgot/reset password, `/activate`, `/join/:code`, `/pending-approval`, `/mfa-verify`.
  - Confirmed required authenticated surfaces exist: users page with status filters/approvals and tenant switcher in sidebar.
  - Legacy `/onboarding/create-organization` route now auto-redirects to `/my-summary` to preserve post-register contract parity.
  - Lint passed for touched dashboard route file.
- Risks or follow-up:
  - Mobile nav still does not expose tenant-switcher controls (desktop profile menu already supports tenant switching).

### E01-E06 - Endpoint contract checks
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `lib/api/error.ts`
  - `services/tenants.service.ts`
  - `hooks/api/use-tenants.ts`
  - `app/(dashboard)/users/page.tsx`
  - `components/auth/signup/signup-form.tsx`
  - `app/(auth)/activate/page.tsx`
  - `app/(auth)/join/[code]/page.tsx`
  - `contexts/auth-context.tsx`
- API endpoints touched:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/staff-activate`
  - `GET|POST /api/v1/auth/join/:inviteCode`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/tenants/:id/staff`
  - `POST|GET|PATCH /api/v1/tenants/:id/invite-link(s)`
- QA evidence (manual + automated):
  - Lint passed across touched files during implementation.
  - Users page + auth routes now align to endpoint contract and route outcomes (dashboard vs pending approval).
- Risks or follow-up:
  - End-to-end API smoke tests are still recommended against staging for full transport-level verification.

### ER01-ER05 - Error playbook checks
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `lib/api/error.ts`
  - `lib/auth/otp.ts`
  - `app/(dashboard)/my-summary/page.tsx`
- API endpoints touched:
  - Shared frontend error layer used by all API integrations
- QA evidence (manual + automated):
  - Added code-aware message mapping for auth/session/invite/tenant error codes.
  - Validation and rate-limit normalization handled centrally (`400/422/429`).
  - Task approval-specific restriction codes now surface explicit UX messages.
- Risks or follow-up:
  - Additional endpoint-specific copy can be tuned with PM/CS language guidance.

### RL01-RL02 - Rate-limit UX checks
- Status: [x]
- Date: 2026-03-19
- Owner: FE integration
- Files changed:
  - `lib/api/error.ts`
  - `lib/auth/otp.ts`
  - `components/auth/signup/step-verification.tsx`
  - `app/(dashboard)/my-summary/page.tsx`
- API endpoints touched:
  - Auth + onboarding endpoints and AI ask flow where retry/cooldown feedback is surfaced
- QA evidence (manual + automated):
  - Shared helper now formats `RATE_LIMIT_EXCEEDED` with retry timing when available.
  - OTP resend UI now sets cooldown from backend cooldown/rate-limit error details.
  - AI request throttling now reuses shared retry guidance copy.
- Risks or follow-up:
  - Consider adding explicit disabled submit timers on login/forgot/reset for stronger anti-spam UX.

## QA Execution Log (Task 1)

### Focused QA Run - 2026-03-19
- Local build verification:
  - `npm run build` passed after fixing one TypeScript guard in invite-link expiry handling.
- Backend smoke commands executed (against `https://zikel-solutions-be.onrender.com/api/v1`):
  - `POST /auth/register` (missing `organizationName`) -> `400` as expected for validation path.
  - `POST /auth/register` (valid payload) -> `403 CAPTCHA_REQUIRED`.
  - `POST /auth/verify-otp` (invalid code) -> `403 CAPTCHA_REQUIRED`.
  - `POST /auth/join/:code` (invalid code) -> `403 CAPTCHA_REQUIRED`.
  - `POST /auth/staff-activate` (invalid code) -> `403 CAPTCHA_REQUIRED`.
  - `GET /auth/join/:code` (invalid code) -> `500 P2021` (unexpected backend-side error).
- Frontend implications:
  - Current production backend still enforces CAPTCHA on public auth endpoints, which conflicts with the no-captcha FE requirement implemented in this branch.
  - Invite-link validation endpoint currently returns an unexpected server error on invalid code in the tested environment.

## Integration Test Log (Task 2)

### Added Test Harness
- Added `vitest` with config at `vitest.config.ts`.
- Added scripts:
  - `npm run test`
  - `npm run test:integration`

### Added Integration Specs
- `tests/integration/api-client.integration.test.ts`
  - Refresh-token rotation and single retry behavior.
  - Session clear on `REFRESH_TOKEN_INVALID`.
  - MFA-required pending request storage and one-time retry.
- `tests/integration/tenants-invite-links.integration.test.ts`
  - Invite-link list normalization.
  - Invite-link create endpoint behavior.
  - Invite-link revoke endpoint behavior.

### Results
- `npm run test` -> passed (`2` files, `6` tests).
- `npm run lint` -> passed.
- `npm run build` -> passed.
