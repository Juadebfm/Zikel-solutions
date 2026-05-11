# Frontend Integration Plan

Source spec: `zikel-solutions-BE/frontend-integration.md` (BE-authored, 2026-05-11).
Schema source of truth: Swagger UI at `/docs`.
This document: workflow / change-set for the tenant FE (`/api/v1/*`). Platform admin (`/admin/*`) is out of scope.

Generated 2026-05-11.

---

## 0. Read this first

- [ ] Read the BE spec end-to-end (~25 min).
- [ ] Bookmark `https://zikel-solutions-be.onrender.com/docs` (Swagger UI).
- [ ] Verify base URLs match [config/env.ts](config/env.ts):
  - Prod (custom domain, DNS migrating): `https://api.zikelsolutions.com`
  - Prod (Render direct, always works): `https://zikel-solutions-be.onrender.com`
  - Local dev: `http://localhost:8080`
- [ ] Run the §12 curl smoke tests against staging.

---

## 1. Current state of the FE codebase

What's already shipped (mostly from the March 2026 push):

| Area | Status | Files |
|---|---|---|
| Care-home-first registration | ✅ Wired | [app/(auth)/register](app/(auth)/register) |
| OTP verify | ✅ Wired | [app/(auth)/verify-email](app/(auth)/verify-email) |
| Login + MFA challenge | ✅ Wired | [app/(auth)/login](app/(auth)/login), [app/(auth)/mfa-verify](app/(auth)/mfa-verify) |
| MFA enrollment | ✅ Wired | [stores/mfa-store.ts](stores/mfa-store.ts), [components/mfa](components/mfa) |
| Activation + invite-link | ✅ Wired | [app/(auth)/activate](app/(auth)/activate), [app/(auth)/join](app/(auth)/join) |
| Refresh-token rotation | ✅ Wired | [lib/api/client](lib/api) |
| Tenant switcher | ✅ Wired | (see [stores/auth-session-store.ts](stores/auth-session-store.ts)) |
| Page-aware AI `/ai/ask` | ✅ Wired | [services/ai.service.ts](services/ai.service.ts), [components/shared/ai-chat-dialog.tsx](components/shared/ai-chat-dialog.tsx) |
| All CRUD modules (employees, homes, young-people, vehicles, tasks, daily-logs, care-groups, forms, documents, uploads, audit, calendar, dashboard, exports, etc.) | ✅ Services + pages exist | [services/](services), [app/(dashboard)](app/(dashboard)) |
| Settings (personal/notifications/organisation) | ✅ Wired | [app/(dashboard)/settings/page.tsx](app/(dashboard)/settings/page.tsx) |

What is **net-new** from this spec:

| Area | Status | Section |
|---|---|---|
| Billing surface (M7) — subscription, plans, quota, checkout, portal, top-ups, cancel, invoices, AI restrictions | ❌ Zero references in repo | §6 |
| Conversational AI (M9) — 6 endpoints, full chat UI | ❌ Service only has `ask()` | §7 |
| Subscription state machine + read-only mode | ❌ No infrastructure | §5 |
| Session-expiry warnings (`/auth/session-expiry`) | ⚠️ Spec exists, verify UI countdown | §4 |
| MFA backup-code login fallback | ⚠️ Verify it's wired on `/mfa-verify` | §4 |
| Impersonation banner (JWT `impersonatorId`) | ❌ Not built | §10 |
| Invoice history page | ❌ New | §6 |
| Quota visualisation `<QuotaPill />` | ❌ New | §6, §7 |
| Reports module (Reg44/Reg45 packs, RI dashboard) | ⚠️ Endpoint exists, audit FE coverage | §9 |
| Safeguarding (chronologies, patterns, risk alerts) | ⚠️ Audit FE coverage | §9 |
| Security-alerts feed (`/audit/security-alerts`) | ⚠️ Audit FE coverage | §9 |

---

## 2. Cross-cutting infrastructure (do this first)

### 2a. Expand the error-code map

[lib/api/error.ts](lib/api/error.ts) needs the full catalog from spec §5. Group handlers by family — every code in the same family takes the same UX action.

| Family | Codes | Default UX |
|---|---|---|
| Auth/token | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `FORBIDDEN`, `TENANT_TOKEN_REJECTED`, `PLATFORM_TOKEN_REJECTED`, `PLATFORM_ONLY` | Refresh-then-logout / inline message |
| Sessions | `NO_REFRESH_TOKEN`, `REFRESH_TOKEN_INVALID`, `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_REUSED`, `SESSION_REVOKED`, `SESSION_IDLE_EXPIRED`, `SESSION_ABSOLUTE_EXPIRED` | Hard logout |
| Tenant | `TENANT_CONTEXT_REQUIRED`, `TENANT_ACCESS_DENIED`, `TENANT_INACTIVE`, `TENANT_NOT_FOUND`, `USER_NOT_FOUND` | Tenant-pick / contact-support |
| MFA | `MFA_REQUIRED`, `MFA_NOT_FOUND`, `MFA_ALREADY_CONFIRMED`, `MFA_CODE_INVALID`, `MFA_BACKUP_INVALID`, `MFA_CHALLENGE_INVALID`, `MFA_CHALLENGE_AUDIENCE` | MFA flow routing |
| Capability | `PERMISSION_DENIED` | Hide / disable |
| Validation | `VALIDATION_ERROR`, `OTP_INVALID` | Map `details` to form fields |
| Billing | `SUBSCRIPTION_PAST_DUE`, `SUBSCRIPTION_INCOMPLETE`, `SUBSCRIPTION_REQUIRED`, `BILLING_NOT_CONFIGURED` | Banner + redirect to billing |
| Impersonation | `IMPERSONATION_ACTIVE`, `IMPERSONATION_REVOKED`, `INVALID_DURATION` | End-session affordance |
| Rate limit | `TOO_MANY_REQUESTS` | Cooldown countdown from headers |
| AI conversation | `CONVERSATION_ARCHIVED` | Inline + offer "create new chat" |

Add one switch in the API client interceptor that maps these to side-effects (toast / banner / redirect / refetch). Don't scatter handling across consumers.

### 2b. Rate-limit header surfacing

Server returns:

```
x-ratelimit-limit: 30
x-ratelimit-remaining: 0
x-ratelimit-reset: 27   ← seconds
```

Add a helper `parseRateLimit(response)` and pipe into a global "cool-down" store keyed by route family. Forms read the cool-down for the route they will hit and disable their submit button + show "Try again in 27s" countdown. Verify on `/auth/login`, `/auth/resend-otp`, `/ai/ask`, `/ai/conversations/*`, billing checkout/portal/topup.

### 2c. Permission gating — use the spec's names

The spec defines real permission names: `billing:read`, `billing:write`, `ai:use`, `ai:admin`, `members:read`, `members:write`, `employees:write`, etc. (full list spec §6).

- [ ] Audit [contexts/auth-context.tsx](contexts/auth-context.tsx). `useAuth().hasPermission('canManageSettings')` is fine as a derived flag, but new gates should reference spec-canonical names where possible.
- [ ] `/me/permissions` returns a derived capability summary: `{ canViewAllHomes, canViewAllYoungPeople, canViewAllEmployees, canApproveIOILogs, canManageUsers, canManageSettings, canViewReports, canExportData }`. **Keep using these** — they are the FE-facing flags. Map new billing/AI features onto new derived flags (`canManageBilling`, `canUseAi`, `canAdminAi`) and ask BE to add them, or compute client-side from `tenantRole`.

### 2d. JWT decoding helper

Spec §4 defines the JWT payload. Add [lib/auth/jwt.ts](lib/auth/jwt.ts) that decodes (does not verify) and exposes:

```ts
decodeAccessToken(token): {
  userId, email, role, tenantId, tenantRole,
  mfaVerified, sessionId, impersonatorId?, impersonationGrantId?,
  exp
}
```

Used by:
- Impersonation banner (§10)
- Session warning countdown (`exp` vs server time)
- Initial UI gating before `/me` returns

Never trust client-decoded JWT for security gates — server re-checks on every request.

---

## 3. Auth flow audit (verify, don't rebuild)

The March work is mostly correct. Reconcile against the new spec body shapes:

### 3a. `POST /auth/register` body — **correction**

Spec body:

```ts
{
  country: 'UK' | 'Nigeria';
  firstName, lastName;
  email, password, confirmPassword;
  acceptTerms: true;
  organizationName: string;
  middleName?, gender?, phoneNumber?;
  organizationSlug?: string;   // optional — slug is back, was tentatively removed
}
```

- [ ] Confirm `confirmPassword` is sent (not just client-validated).
- [ ] Confirm `country` is a required dropdown (`UK | Nigeria` only).
- [ ] Keep `organizationSlug` as an optional advanced field.
- [ ] `acceptTerms: true` is a literal — not a boolean — schema rejects `false`.

### 3b. `POST /auth/verify-otp` — dual body shape

Accepts both modern `{ email, code }` and legacy `{ userId, code, purpose }`. Use the modern form going forward.

### 3c. `POST /auth/login` — 3-outcome union

Confirm the response handler covers all three. Each path stores its own token:

```ts
type LoginResponse =
  | { user, session, tokens, serverTime }                                              // A: direct
  | { mfaRequired: true; challengeToken; challengeExpiresInSeconds: number }            // B: challenge
  | { mfaEnrollmentRequired: true; enrollmentToken; enrollmentExpiresInSeconds: number };  // C: enroll
```

Store `challengeToken` / `enrollmentToken` in `sessionStorage` (short-lived). Show a countdown timer using `*ExpiresInSeconds`.

### 3d. Refresh rotation

Single-use rotation. If `REFRESH_TOKEN_REUSED` comes back → kill the entire session immediately (server already does this; FE must just route to login and clear store).

### 3e. Session-expiry endpoint (NEW UI surface)

`GET /auth/session-expiry` returns server time + `idleExpiresAt`, `absoluteExpiresAt`, `warningWindowSeconds`, `tokens.refreshTokenExpiresAt`.

Add a global session-warning component:
- Poll on focus, or compute from cached values.
- When `now > idleExpiresAt - warningWindowSeconds` → show "Session ending soon. Stay signed in?" modal with a 60s countdown that fires `/auth/refresh` on click.
- Drives against server time (not local clock).

### 3f. Three staff onboarding paths (verify)

| Path | Endpoint | UI |
|---|---|---|
| Email invite | `POST /api/v1/invitations` | "Send invite by email" |
| Reusable invite link | `POST /api/v1/tenants/:id/invite-links` | "Generate shareable link" |
| Direct provision | `POST /api/v1/tenants/:id/staff` | "Create staff account" |

All three should be in Settings → Members. Audit that all three are currently selectable.

---

## 4. MFA gap audit

| Endpoint | Status | Notes |
|---|---|---|
| `POST /auth/mfa/totp/verify` | ✅ Wired | Challenge flow |
| `POST /auth/mfa/backup/verify` | ⚠️ Verify | Add "Use a backup code" link on `/mfa-verify`. Rate limit is 5 / 5min (slow). |
| `POST /auth/mfa/totp/enroll/setup` | ✅ Wired | QR + backup codes |
| `POST /auth/mfa/totp/enroll/confirm` | ✅ Wired | |
| `GET /auth/mfa/status` | ⚠️ New surface | Drive Settings → Security tab |
| `POST /auth/mfa/totp/setup` | ⚠️ New surface | Authenticated re-enrollment |
| `POST /auth/mfa/totp/verify-setup` | ⚠️ New surface | Confirms re-enrollment |
| `DELETE /auth/mfa/totp` | ⚠️ New surface | Requires `currentPassword` |

Add a Settings → Security tab that surfaces `enabled` + `backupCodesRemaining`. When remaining ≤ 3, show a low-codes warning + CTA to regenerate (run setup → verify-setup flow).

---

## 5. Subscription state machine (NEW — core infra)

The new mental model. Build this once; everything else depends on it.

### 5a. `useSubscription()` hook

New [services/billing.service.ts](services/billing.service.ts) + [hooks/api/use-billing.ts](hooks/api/use-billing.ts).

```ts
useSubscription()    // GET /billing/subscription, 60s staleTime, refetch on focus
```

Response (spec §M7):

```ts
{
  status, plan, trialEndsAt, currentPeriodStart, currentPeriodEnd,
  cancelAtPeriodEnd, pastDueSince, manuallyOverriddenUntil,
  ui: {
    isInTrial, daysLeftInTrial,
    isReadOnly, isSuspended, isCancelled,
    pastDueSinceDays
  }
}
```

**Rule:** drive all UI from `ui.*`. Do **not** match on `status` strings. BE already folds `manuallyOverriddenUntil` and impersonation into `isReadOnly`.

### 5b. Subscription store

New [stores/subscription-store.ts](stores/subscription-store.ts) (zustand) — exposes:

```ts
selectIsReadOnly()    // boolean
selectBannerVariant() // null | 'trial' | 'past_due_grace' | 'past_due_readonly' | 'incomplete' | 'suspended' | 'cancelled'
selectTrialDaysLeft() // number | null
```

Subscribed to by [contexts/auth-context.tsx](contexts/auth-context.tsx) so layouts have read access without a second provider.

### 5c. Top-of-app banner

`<SubscriptionBanner />` in [components/layout/](components/layout) rendered above the page slot in [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx).

| Variant | Colour | Copy (sample) | CTA | Dismissable |
|---|---|---|---|---|
| `trial` | Amber | "Trial · X days left" | "Choose a plan" → `/settings/billing` | Yes (24h) |
| `past_due_grace` | Amber | "Payment failed. Update card to keep working." | "Update card" → portal session | No |
| `past_due_readonly` | Red | "Past due — read-only mode" | "Update card" → portal session | No |
| `incomplete` | Red | "Finish setting up your subscription" | "Complete payment" → checkout | No |
| `suspended`/`cancelled` | n/a — login is blocked anyway | — | — | — |

### 5d. Read-only enforcement

When `selectIsReadOnly() === true`:

1. **Client-side preemption** — disable every mutation button + AI input + export button. Use a single `<MutationButton>` wrapper that reads the flag + adds a tooltip ("Subscription past due — update billing to re-enable").
2. **Server fallback** — API client interceptor catches 402 `SUBSCRIPTION_PAST_DUE` or `SUBSCRIPTION_INCOMPLETE`, refetches `/billing/subscription` (state may have just flipped), and asserts the banner is visible.

Audit checklist — every form/list page should disable saves under read-only:
- Employees, Young People, Homes, Vehicles, Care Groups, Tasks, Daily Logs, Documents, Forms, Roles, Members, Rotas, Calendar, Sensitive Data, Safeguarding, Announcements, Webhooks, Exports.
- AI ask + conversation composer.

---

## 6. Billing UI (NEW — largest piece of FE work)

Zero references in the repo today. Build out the full surface.

### 6a. Service layer

```ts
// services/billing.service.ts
getSubscription()              // GET  /billing/subscription
getPlans()                     // GET  /billing/plans
getQuota()                     // GET  /billing/quota
getInvoices(page, pageSize)    // GET  /billing/invoices       (NEW — paginated)
getAiRestrictions()            // GET  /billing/ai-restrictions
updateAiRestrictions(body)     // PUT  /billing/ai-restrictions
createCheckoutSession(planCode)// POST /billing/checkout-session
createPortalSession()          // POST /billing/portal-session
createTopupSession(packCode)   // POST /billing/topup-checkout-session
cancel()                       // POST /billing/cancel
```

Permission gates: reads → `billing:read`; writes → `billing:write`.

### 6b. Settings → Billing page

New route: [app/(dashboard)/settings/billing/page.tsx](app/(dashboard)/settings/billing/page.tsx).

Tabs or sections:

1. **Current plan** — read from `/billing/subscription`. Show plan name, price (format `unitAmountMinor / 100`), interval, current period end, cancel-at-period-end notice, `manuallyOverriddenUntil` notice if active.
2. **Plan switcher** — two tiles from `/billing/plans`:
   - `standard_monthly` £30/mo, 1,000 bundled calls
   - `standard_annual` £300/yr, 1,000 bundled calls
   - CTA → `createCheckoutSession({ planCode })` → `window.location.assign(url)`
3. **Top-up packs** — three tiles (small £5/250, medium £15/1000, large £40/5000). CTA → `createTopupSession({ packCode })`. **Hide if no active subscription** (or surface `SUBSCRIPTION_REQUIRED` 409 inline).
4. **Quota viz** — see §6c.
5. **AI restrictions** — see §6d. Gated on `billing:write` (Owner-only).
6. **Invoice history** — paginated list from `/billing/invoices`. Columns: date, period, amount, status, [View hosted URL], [PDF]. Stripe `hostedInvoiceUrl` and `pdfUrl` open in new tab.
7. **Manage / cancel** — buttons:
   - "Manage card / invoices in Stripe" → `createPortalSession()`
   - "Cancel subscription" → modal confirming `cancel()` returns `currentPeriodEnd` and access continues until then.

Add a "Billing" item to the Settings page tabs list.

### 6c. Quota viz (canonical version + pill)

`/billing/quota` returns (spec §M7):

```ts
{
  allocationId,
  bundledCalls, topUpCalls, usedCalls, remainingCalls,
  periodStart, periodEnd, resetAt,
  perUserUsage: [{ userId, name, email, role, callsThisPeriod }],
  restrictions: { perRoleCaps, perUserCaps }
}
```

**Canonical card** on the billing page:
- Big number: `remainingCalls`
- Progress bar: `usedCalls / (bundledCalls + topUpCalls)`
- Subtext: "Resets {resetAt}"
- Per-user table (sortable by `callsThisPeriod`).

**Reusable pill** `<QuotaPill />`:
- Reads `useQuota()`.
- Shows `remainingCalls` with colour coding (green > 100, amber 11–100, red ≤ 10).
- On hover → popover with the breakdown.
- Rendered in: conversational AI composer, one-shot AI dialog header, and as a sidebar widget for owners/admins.

### 6d. AI restrictions form

Spec §M7 `PUT /billing/ai-restrictions`:

```ts
{
  perRoleCaps?: { [role: string]: number | null },   // null = uncapped, 0 = disabled, positive = monthly cap
  perUserCaps?: { [userId: string]: number | null }
}
```

UI:
- **Per-role rows** for each known role (`tenant_admin`, `sub_admin`, `staff`). Each has: ⬜ Uncapped / ⬜ Disabled / 🔢 Monthly limit.
- **Per-user table** with search. Override a role default for a specific user.
- Save button bound to `useUpdateAiRestrictions`.

Owner-only — gate on `tenantRole === 'tenant_admin'` (or a new `canManageBilling` flag).

### 6e. Return pages

Stripe redirects to env-configured URLs:
- `BILLING_CHECKOUT_SUCCESS_URL` → new [app/(dashboard)/settings/billing/success/page.tsx](app/(dashboard)/settings/billing/success/page.tsx). On mount: invalidate `useSubscription` + `useQuota` + `useInvoices`. Show "Welcome!" + "Continue to dashboard".
- `BILLING_CHECKOUT_CANCEL_URL` → can point back to `/settings/billing` with a toast "Checkout cancelled".
- `BILLING_PORTAL_RETURN_URL` → `/settings/billing` and refetch.

Confirm with Julius that these env vars point to FE-controlled routes.

### 6f. `BILLING_NOT_CONFIGURED` handling

503 with this code means Stripe keys aren't configured in this environment (typical for local dev). Hide all billing UI behind a feature flag derived from a one-time check on the plans endpoint at app boot. Don't render the billing tab if `BILLING_NOT_CONFIGURED` is seen.

---

## 7. AI surfaces

### 7a. Page-aware `/ai/ask` — corrections

Existing service is mostly right. Three deltas from spec:

- [ ] **402 handling**: `SUBSCRIPTION_PAST_DUE` → inline "Out of AI calls or subscription past due. [Top up / Update billing]" CTA chip instead of generic error.
- [ ] **403 `PERMISSION_DENIED`** if user lacks `ai:use` → hide the AI button entirely on that page.
- [ ] **429** → read `x-ratelimit-reset`, disable input with countdown.
- [ ] **Note**: `/ai/ask` debits 1 quota call **even on fallback** (`source: 'fallback'`). Quota pill updates accordingly.

Existing files: [services/ai.service.ts](services/ai.service.ts), [hooks/api/use-ai.ts](hooks/api/use-ai.ts), [components/shared/ai-chat-dialog.tsx](components/shared/ai-chat-dialog.tsx).

### 7b. Conversational AI — NEW page

Extend [services/ai.service.ts](services/ai.service.ts):

```ts
createConversation()                              // POST   /ai/conversations
listConversations({ page, pageSize, includeArchived })  // GET
getConversation(id)                               // GET    /ai/conversations/:id
sendMessage(id, content)                          // POST   /ai/conversations/:id/messages
patchConversation(id, { title?, archived? })      // PATCH  /ai/conversations/:id
deleteConversation(id)                            // DELETE /ai/conversations/:id  (hard)
```

**Important shape clarifications from spec §M9:**

- `POST .../messages` returns **only** `{ assistantMessage }` — not `{ userMessage, assistantMessage }`. FE owns the optimistic user-message append; on success, just append the assistant reply.
- Assistant messages may carry `fallbackUsed?: boolean` — show a small "Offline fallback" badge when `true`.
- `title` is auto-generated server-side after ~3 exchanges (fire-and-forget). FE does **not** generate. Show "New chat" until `title` populates.
- History window is 20 messages server-side. FE doesn't truncate.

New route: [app/(dashboard)/ai/page.tsx](app/(dashboard)/ai/page.tsx).

Layout:

```
┌──────────────┬─────────────────────────────────┐
│ + New chat   │  Conversation title (or "New chat")
│              │  ─────────────────────────────  │
│ Convo 1   ●  │  Assistant: hello…              │
│ Convo 2      │  You: …                          │
│ Convo 3      │  Assistant: …  [Offline fallback]│
│ ───────      │                                  │
│ Archived ▾   │  ─────────────────────────────  │
│              │  [Composer]    QuotaPill: 247    │
└──────────────┴─────────────────────────────────┘
```

Send flow:
1. Append user message optimistically with status `sending`.
2. `await sendMessage(id, content)`.
3. On success → append `assistantMessage`; mark user message `sent`; invalidate `useQuota()`.
4. On `409 CONVERSATION_ARCHIVED` → toast + offer "Start a new chat".
5. On `402 SUBSCRIPTION_PAST_DUE` → block composer + show banner.
6. On rate-limit → cooldown.

Composer disabled when:
- `selectIsReadOnly()` true
- `remainingCalls === 0`
- user lacks `ai:use`

Archive vs delete:
- Archive (`PATCH { archived: true }`) is the default tidy-up affordance.
- Hard delete requires explicit confirmation modal with destructive copy ("This cannot be undone").

Add entry points: top-bar icon and floating action button on dashboard/my-summary pages, both linking to `/ai`.

---

## 8. Uploads — refine to spec

Existing [services/uploads.service.ts](services/uploads.service.ts) probably has the old shape. Spec §M19 mandates:

1. `POST /uploads/sessions` body must include `purpose: 'signature' | 'task_attachment' | 'task_document' | 'announcement_image' | 'general'`. Add a `purpose` parameter to every caller.
2. Response shape:
   ```ts
   {
     file: { id, fileName, contentType, sizeBytes, uploadStatus: 'pending', checksumSha256, createdAt },
     upload: { method: 'PUT', url, expiresAt, headers: { 'Content-Type': string } }
   }
   ```
3. PUT to `upload.url` with the headers from `upload.headers` (not invented ones).
4. `POST /uploads/:id/complete` confirms; response carries a 7-day signed `download.url`.
5. Optional `checksumSha256` — compute client-side for integrity if available.

Audit every caller (avatars, signatures, task attachments, announcement images) for the `purpose` field.

---

## 9. Endpoint surfaces to verify (already-built modules)

These services exist in the repo; reconcile each against the new spec, focusing on body/query shapes that may have drifted.

| Module | Spec ref | Quick checks |
|---|---|---|
| Employees | M11 | `status: current|past|planned`, `roleId`, `dbsNumber`, `dbsDate` fields. |
| Homes | M10 | Sub-resources mounted: `/summary`, `/events`, `/shifts`, all `/reports/*`. |
| Young People | M12 | Sensitive fields gated on `young_people:sensitive_read`. |
| Vehicles | M13 | `sortBy` enum: `registration|make|model|nextServiceDue|motDue|createdAt|updatedAt`. |
| Tasks | M14 | New: `taskRef`, `formGroup`, `lifecycleStatusLabel`, `approvalStatus`, `labels`. Batch endpoints (archive/postpone/reassign). |
| Daily logs | M15 | `relatesTo: { type, id }` shape. **DELETE is hard.** |
| Forms | M18 | `builder`, `access`, `triggerTask`, `notifications` nested. Submissions endpoint `/forms/:id/submissions`. |
| Documents | M17 | `visibility: private|tenant|home`. DELETE is hard. |
| Audit | M21 | NEW: `/audit/security-alerts?lookbackHours=` — surface in a security widget. |
| Reports | M29 | Confirm Reg44/Reg45 packs + RI dashboard pages exist (gated on `reports:read`). |
| Safeguarding | M32 | Chronologies + patterns + risk alerts — confirm pages render and rule list comes from `/risk-alerts/rules`. |
| Sensitive data | M33 | Access is auto-logged. DELETE is hard. |
| Help center | M26 | FAQs + tickets (with comments). |
| Notifications | M27 | `unread-count` for badge; `read-all` for bulk. |
| Exports | M24 | Async job pattern: poll until status ready, then `/exports/:id/download`. |
| Settings | M34 | Org + notifications. |
| Summary | M35 | Approval batch endpoint `/tasks-to-approve/process-batch` with `action: approve|reject`. |
| Webhooks | M36 | Customer-owned outbound webhooks UI: create + test + deliveries log. |

For each: open `/docs`, find the endpoint, compare to current TS types in `services/`, file follow-ups for any drift.

---

## 10. Impersonation banner (NEW)

Platform staff can impersonate tenant users for support. The tenant FE doesn't initiate this, but it must respect it.

JWT carries `impersonatorId` and `impersonationGrantId` when active (spec §4).

UI:
- Decode JWT on session load (§2d).
- If `impersonatorId` present → render persistent yellow banner at top: `"Support session active. Acting as <user.name> on <tenant.name>. [End session]"`.
- "End session" → `DELETE /admin/impersonation/active` (impersonation token will work for this) → on success, logout + redirect to a "Support session ended" landing page.
- Handle `401 IMPERSONATION_REVOKED` — same flow: clear session, return to login.
- Block UI: while impersonating, hide self-mutating account flows (change password, MFA disable). Server already blocks with `IMPERSONATION_ACTIVE` 409.

---

## 11. Suggested build order

1. **Infrastructure** (§2) — error map, rate-limit helper, JWT decoder. Foundation; no UI yet.
2. **Subscription store + banner** (§5) — biggest leverage; unblocks read-only enforcement everywhere.
3. **Billing service + Settings → Billing page** (§6) — biggest user-visible surface.
4. **Quota pill + AI 402 polish** (§6c, §7a).
5. **Conversational AI page** (§7b).
6. **Session-expiry warnings** (§3e) — independent, can be parallelised.
7. **MFA Security tab + backup-code link** (§4) — independent.
8. **Uploads `purpose` field audit** (§8).
9. **Endpoint-drift audits** (§9) — rolling; one module per PR.
10. **Impersonation banner** (§10) — cheap; do alongside JWT decoder.

---

## 12. Acceptance criteria

End-to-end smoke tests that prove the redesign:

- **Onboarding**: new owner registers (`country`, `firstName`, `lastName`, `email`, `password`, `confirmPassword`, `acceptTerms`, `organizationName`) → OTP verify → MFA enrollment QR + backup codes → land in dashboard with trial banner showing `daysLeftInTrial`.
- **Plan purchase**: trial banner CTA → `/settings/billing` → click "Standard monthly" → Stripe checkout test card → land on success page → banner clears within 60s.
- **Top-up**: from billing page → "Top-up Small" → Stripe checkout → quota pill increases by 250 within 30s of webhook.
- **Read-only mode**: a tenant in `past_due_readonly` logs in → red banner visible → 5 sample mutation buttons disabled → "Update card" CTA opens portal → on return, banner clears.
- **Conversational AI**: create chat → send 3 messages → quota ticks down by 3 → archive chat → unarchive → hard-delete with confirm.
- **Session warning**: 14 minutes of inactivity → warning modal appears → "Stay signed in" hits `/auth/refresh` → modal dismisses, counter resets.
- **MFA backup**: lose phone simulation → on `/mfa-verify` click "Use a backup code" → enter 8-char code → land in dashboard.
- **Impersonation**: support session JWT pasted in → banner shows "Acting as…" → End session works → back to login.

---

## 13. Out of scope

- `/admin/*` platform admin routes (separate FE app).
- `/integrations/billing/webhook` and `/integrations/security-alerts/webhook` — server-to-server.
- Streaming responses for conversational AI — spec explicitly says no streaming.
- `/public/*` marketing forms — owned by the marketing site, not the app.

---

## 14. Open questions for BE (Julius)

- Confirm `BILLING_CHECKOUT_SUCCESS_URL` / `BILLING_CHECKOUT_CANCEL_URL` / `BILLING_PORTAL_RETURN_URL` env values point to FE routes we own.
- Add `canManageBilling`, `canUseAi`, `canAdminAi` to `/me/permissions` derived flags? Or should FE compute from `tenantRole` + permissions list?
- Per-user quota breakdown (`perUserUsage[]`) — capped or full list? Affects FE pagination.
- For `/auth/session-expiry` — recommended polling cadence? (Defaulting to fetch-on-focus + computed-from-cache for the warning logic.)
- `/audit/security-alerts` — should this drive a dashboard widget, or only an alerts page?
- Reg44/Reg45 reports — confirm they return file streams for the `format=pdf|excel|zip` cases; FE handles via `.blob()`.
