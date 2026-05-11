# Frontend Integration Plan — Checklist

Source spec: `zikel-solutions-BE/frontend-integration.md` (BE-authored, 2026-05-11).
Schema source of truth: Swagger UI at `/docs`.
Scope: tenant FE (`/api/v1/*`). Platform admin (`/admin/*`) is out of scope.

Last updated: 2026-05-11 (latest: gating sweep — items 1, 2, 3 from §"What's left"; commit pending).

---

## Status legend

- `[x]` Done — code shipped and verified
- `[ ]` Not started
- `[~]` Partial — see note for what's missing
- `[⏸]` Deferred — see note for the blocker / reason
- `[→]` Verify-only — already wired before this push; left untouched

---

## Top-line scorecard

| Slice | Status | Commit |
|---|---|---|
| Slice 1 — Billing infra + banner | ✅ Done | `5197b18` |
| Slice 2 — Settings → Billing page | ✅ Done | `5197b18` |
| Slice 3 — Read-only gate + 402 interceptor | ✅ Done — all major mutation surfaces gated (forms dropdown + my-summary + task drawer + users + scheduling + sensitive-data + AI dialog) | `5197b18` + sweep |
| Slice 4 — Conversational AI (`/ai`) | ✅ Done | `5197b18` |
| Slice 5 — AI dialog polish + MutationButton sweep | ~ Partial — 429 cooldown missing; AI button hide ✅ done | `5197b18` + sweep |
| Slice 6 — Auth polish (MFA Security, impersonation, backup codes) | ~ Partial — login enrollment branch deferred | `5197b18` |
| Cross-cutting — central error map | ~ Partial — billing codes only, no central switch | `5197b18` |
| Cross-cutting — rate-limit headers / cooldown store | ❌ Not started | — |
| Cross-cutting — permission gating with spec names | ~ Partial — using `tenantRole` checks | `5197b18` |
| Uploads — `purpose` enum compliance | ⏸ Deferred — needs caller audit | — |
| Endpoint-drift audits | ❌ Not started | — |
| `mfaEnrollmentRequired` login branch | ⏸ Deferred — needs BE alignment | — |

---

## 0. Orientation

- [ ] **User task**: Read the BE spec end-to-end (~25 min)
- [ ] **User task**: Bookmark `https://zikel-solutions-be.onrender.com/docs`
- [x] Verify base URLs in [lib/api/config.ts](lib/api/config.ts) — `DEFAULT_BACKEND_ORIGIN = "https://zikel-solutions-be.onrender.com"` ✓
- [ ] **User task**: Run the spec §12 curl smoke tests against staging

---

## 2. Cross-cutting infrastructure

### 2a. Error code map

- [~] Friendly messages added — [lib/api/error.ts](lib/api/error.ts) has the billing codes (`SUBSCRIPTION_PAST_DUE`, `SUBSCRIPTION_INCOMPLETE`, `SUBSCRIPTION_REQUIRED`, `BILLING_NOT_CONFIGURED`, `AI_DISABLED_FOR_TENANT`, `CONVERSATION_ARCHIVED`).
- [ ] **Missing**: friendly messages for `TENANT_TOKEN_REJECTED`, `PLATFORM_TOKEN_REJECTED`, `PLATFORM_ONLY`, `ACCOUNT_LOCKED`, `MFA_CHALLENGE_INVALID`, `MFA_CHALLENGE_AUDIENCE`, `IMPERSONATION_*`, `REFRESH_TOKEN_REUSED` (some already exist), `TENANT_NOT_FOUND`, `USER_NOT_FOUND`.
- [~] Central side-effect switch — only the 402 family fires a side-effect (subscription refetch via [`registerBillingGateListener`](lib/api/client.ts)). Other families still throw plain `ApiClientError` and rely on consumers.
- [ ] **Missing**: extract one switch so families map to default toast/banner/redirect/refetch actions — currently scattered across consumers.

### 2b. Rate-limit headers & cooldown store

- [ ] Build `parseRateLimit(response)` helper
- [ ] Build global cool-down store keyed by route family
- [ ] Wire on `/auth/login`, `/auth/resend-otp`, `/ai/ask`, `/ai/conversations/*`, billing checkout/portal/topup
- [→] `extractRetryAfterSeconds` exists for friendly error messages — partial coverage only

### 2c. Permission gating

- [~] Code gates on `activeTenantRole === 'tenant_admin'` for billing AI restrictions + on existing `canManageSettings`. No spec-canonical `billing:read` / `ai:use` / `ai:admin` flags wired.
- [ ] **Open question for BE**: add `canManageBilling`, `canUseAi`, `canAdminAi` to `/me/permissions`, or compute client-side from `tenantRole`?

### 2d. JWT decoder helper

- [x] [lib/auth/jwt.ts](lib/auth/jwt.ts) — `decodeAccessToken()` returns `TenantJwtPayload` with `impersonatorId`, `impersonationGrantId`, etc. + `isImpersonating()` helper. Pure, no signature verification.

---

## 3. Auth flow audit

### 3a. `POST /auth/register` body

- [x] `country: UK | Nigeria` — required dropdown ✓
- [x] `firstName`, `lastName` — required ✓
- [x] `email`, `password`, `confirmPassword` — wired (see [services/auth.service.ts:277-285](services/auth.service.ts))
- [x] `acceptTerms: true` literal — sent ✓
- [x] `organizationName` — sent ✓
- [x] `organizationSlug` — optional, sent when provided ✓

### 3b. `POST /auth/verify-otp` — dual body shape

- [x] Modern `{ email, code }` primary; legacy `{ userId, otp }` fallback via `shouldRetryWithLegacyBody` ✓

### 3c. `POST /auth/login` — 3-outcome union

- [→] Outcome A (direct success): wired (`session.mfaRequired === false`)
- [→] Outcome B (MFA challenge): wired via existing modal flow (uses older `/auth/mfa/challenge` endpoint, not the new `challengeToken` model)
- [⏸] Outcome C (`mfaEnrollmentRequired`): **NOT wired**. Login response handling assumes the older envelope shape. New discriminated-union model needs a full refactor of `authService.login` + `mfa-store` + `mfa-modal` + `/mfa-verify` page.
  - **Blocker**: BE confirmation needed — does production currently return the new union or the old envelope?
- [ ] Store `challengeToken` / `enrollmentToken` in `sessionStorage` with `*ExpiresInSeconds` countdown

### 3d. Refresh rotation

- [→] Single-use rotation enforced — [lib/api/client.ts:248-254](lib/api/client.ts) clears session on `REFRESH_TOKEN_REUSED` / `REFRESH_TOKEN_INVALID` / `SESSION_*_EXPIRED`

### 3e. Session-expiry endpoint

- [→] `<SessionExpiryBanner />` already mounted in [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx); fires modal at `idleExpiresAt - warningWindowSeconds` driven by server time offset; "Stay signed in" calls `/auth/refresh`

### 3f. Three staff onboarding paths

- [→] Email invite via `POST /api/v1/invitations` — wired
- [→] Reusable invite link via `POST /api/v1/tenants/:id/invite-links` — wired
- [→] Direct provision via `POST /api/v1/tenants/:id/staff` — wired

---

## 4. MFA gap audit

- [→] `POST /auth/mfa/totp/verify` — wired (older challenge flow)
- [x] `POST /auth/mfa/backup/verify` — added "Use a backup code" toggle on [/mfa-verify](app/(auth)/mfa-verify/page.tsx); calls `authService.verifyMfaBackup` (new method)
- [→] `POST /auth/mfa/totp/enroll/setup` — wired
- [→] `POST /auth/mfa/totp/enroll/confirm` — wired
- [x] `GET /auth/mfa/status` — new service method + `useMfaStatus` hook + status card UI
- [x] `POST /auth/mfa/totp/setup` — wired in `<MfaSecurityCard />`
- [x] `POST /auth/mfa/totp/verify-setup` — wired
- [x] `DELETE /auth/mfa/totp` — wired (password-confirmation dialog)
- [x] Settings → Security surface — built as `<MfaSecurityCard />` on the Personal tab of [Settings](app/(dashboard)/settings/page.tsx) (not a separate tab — visible to every user)
- [x] Low-codes warning (≤ 3 remaining) — wired

---

## 5. Subscription state machine

### 5a. `useSubscription()` hook

- [x] [services/billing.service.ts](services/billing.service.ts) — `getSubscription()` returns full `Subscription` with `ui.*` flags
- [x] [hooks/api/use-billing.ts](hooks/api/use-billing.ts) — `useSubscription()` with 60s staleTime + `refetchOnWindowFocus: true`

### 5b. Subscription store

- [x] Functional equivalent shipped. Did **NOT** create `stores/subscription-store.ts` — TanStack Query cache IS the store. Selectors live as hooks: `useIsReadOnly`, `useSubscriptionBannerVariant`, `useTrialDaysLeft`.

### 5c. Top-of-app banner

- [x] `<SubscriptionBanner />` mounted in [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx)
- [x] Trial variant — amber, dismissable (localStorage flag, persistent until trial ends or user clears storage)
- [x] `past_due_grace` — amber, sticky, CTA → Stripe portal
- [x] `past_due_readonly` — red, sticky, CTA → Stripe portal
- [x] `incomplete` — red, sticky, CTA → `/settings/billing`
- [x] `suspended` / `cancelled` — red, no CTA (login is blocked at BE anyway)

### 5d. Read-only enforcement

- [x] `<MutationButton>` wrapper at [components/ui/mutation-button.tsx](components/ui/mutation-button.tsx) — lock icon + tooltip + billing link
- [x] 402 server-fallback interceptor at [lib/api/client.ts](lib/api/client.ts) — refetches subscription + quota when server rejects
- [x] **Audit pass — ~35 mutation surfaces gated.** Done:
  - [x] Employees: create dialog, create-with-user dialog, detail drawer
  - [x] Young People: create drawer, detail drawer
  - [x] Homes: create drawer, detail drawer
  - [x] Vehicles: create dialog, detail drawer
  - [x] Care Groups: create dialog, detail drawer
  - [x] Tasks: create dialog
  - [x] Daily Logs: create dialog
  - [x] Documents: delete confirmation
  - [x] Safeguarding: Add Note, Acknowledge, In Progress, Resolve (4 buttons)
  - [x] AI Chat dialog: "Ask AI" button
  - [x] AI Conversation composer: send button
  - [x] **Task Explorer detail drawer**: Approve, Reject, Reassign, Send comment
  - [x] **Scheduling**: Create Event (save), Delete Event, Create Rota, Delete Rota
  - [x] **Sensitive Data**: Create Record (page + dialog), Delete Record
  - [x] **Users page**: Provision Staff, Generate Link, Revoke Link, Send Invite, Approve membership, Revoke Invite (6 buttons)
  - [x] **My Summary — pending-approval**: Approve, Reject, Reassign (3 confirm-dialog buttons)
  - [x] **My Summary — drafts**: Submit, Delete, Reassign (3 confirm-dialog buttons)
  - [x] **My Summary — overdue-tasks**: Archive, Reassign, Postpone (3 confirm-dialog buttons)
  - [x] **Forms list**: Clone, Publish, Archive DropdownMenuItem actions (inline `useIsReadOnly()` check with "Read-only" hint)
- [ ] **Still ungated (lower priority):**
  - [ ] Settings page Save profile / Save notifications / Save organisation — intentionally not gated (user prefs)
  - [ ] Announcements — pin/archive (if those buttons exist; create dialog wasn't found in inventory)
  - [ ] Webhooks — create / test / delete (page may not exist yet)
  - [ ] Exports — start async export (page may not exist yet)
  - [ ] Roles — create / update / permission assignment (separate roles page TBD)
  - [ ] MFA modal Verify — intentionally NOT gated (auth flows must remain usable)
  - [ ] Per-row opener Buttons in my-summary that just open confirm dialogs (the confirm dialog buttons themselves ARE gated — server is the source of truth, this is just a polish gap)

---

## 6. Billing UI

### 6a. Service layer ([services/billing.service.ts](services/billing.service.ts))

- [x] `getSubscription()`
- [x] `getPlans()`
- [x] `getQuota()`
- [x] `listInvoices({ page, pageSize })`
- [x] `getAiRestrictions()`
- [x] `updateAiRestrictions(payload)`
- [x] `createCheckoutSession(planCode)`
- [x] `createTopupCheckoutSession(packCode)`
- [x] `createPortalSession()`
- [x] `cancelSubscription()`
- [x] Helpers: `pickBannerVariant()`, `formatMinorAmount()`

### 6b. Settings → Billing page ([app/(dashboard)/settings/billing/page.tsx](app/(dashboard)/settings/billing/page.tsx))

- [x] Current plan card — status badge, plan, price, period end, manage card CTA, cancel-scheduled / manual-override notices
- [x] Plan switcher — monthly + annual tiles with savings hint and current-plan lock
- [x] Top-up packs — small / medium / large, gated on having an active subscription
- [x] Quota viz (canonical card with per-user usage table)
- [x] AI restrictions form — per-role; Owner-only
- [x] Invoice history — paginated, status badges, hosted-URL + PDF links
- [x] Cancel subscription dialog — quotes `currentPeriodEnd` from response
- [x] "Billing" link card added to main [Settings](app/(dashboard)/settings/page.tsx) page
- [⏸] AI restrictions form — **per-user** overrides table. Note added pointing users to the Users page for now.

### 6c. Quota viz

- [x] Canonical `<QuotaCard />` on billing page
- [x] Reusable `<QuotaPill />` — green / amber / red with hover popover breakdown
- [x] Rendered in: AI chat dialog footer, conversational AI composer, billing page

### 6d. AI restrictions form

- [x] Per-role rows — Uncapped / Capped / Disabled radio + numeric cap input
- [x] Save bound to `useUpdateAiRestrictions` (invalidates restrictions + quota queries)
- [x] Dirty-state tracking
- [⏸] Per-user overrides table

### 6e. Return pages

- [x] `/settings/billing/success` — invalidates `billing.subscription`, `billing.quota`, `billing.invoicesBase` on mount, shows "thanks" + "go to dashboard"
- [x] Portal / checkout cancel return → `/settings/billing` (no separate page)
- [ ] **Open question for BE**: confirm `BILLING_CHECKOUT_SUCCESS_URL`, `BILLING_CHECKOUT_CANCEL_URL`, `BILLING_PORTAL_RETURN_URL` env values point to FE-controlled routes

### 6f. `BILLING_NOT_CONFIGURED` handling

- [ ] Hide billing UI in environments where Stripe is unconfigured. Currently the billing page renders skeletons and would error on `/billing/plans` 503. Needs an app-boot probe + feature flag.

---

## 7. AI surfaces

### 7a. One-shot `/ai/ask` polish

- [x] `402 SUBSCRIPTION_PAST_DUE` / `SUBSCRIPTION_INCOMPLETE` → inline CTA chip with "Open billing settings →" link; loud error modal suppressed for billing-gated errors
- [x] `403 AI_DISABLED_FOR_TENANT` → "AI is disabled for this organization. Contact your Owner."
- [x] `403 PERMISSION_DENIED` → "You do not have permission to use AI."
- [x] `403 MFA_REQUIRED` → "Additional verification is required before using AI."
- [x] "Ask AI" button → `<MutationButton>` (auto-disables on read-only)
- [x] `<QuotaPill />` in dialog footer
- [x] **AI entry buttons hidden** when `user.aiAccessEnabled === false`. Added `aiAccessEnabled` to `User` type + AuthApiUser mapping. New `useCanUseAi()` hook + reusable `<AskAiButton>` component swapped across 7 consumers (employees, young-people, care-groups, tasks, daily-logs, homes, vehicles).
- [ ] **Missing**: 429 cooldown countdown — friendly message shown but no UI countdown disabling input for N seconds

### 7b. Conversational AI

- [x] 6 service methods: `createConversation`, `listConversations`, `getConversation`, `sendMessage`, `patchConversation`, `deleteConversation`
- [x] New route `/ai` ([app/(dashboard)/ai/page.tsx](app/(dashboard)/ai/page.tsx))
- [x] `<ConversationSidebar />` — list, "+ New chat", archived toggle, per-row archive / restore / delete
- [x] `<ConversationThread />` — user/assistant bubbles, optimistic pending bubble, animated typing dots
- [x] `<FallbackBadge />` — "Offline fallback" pill on assistant messages with `fallbackUsed: true`
- [x] `<MessageComposer />` — Enter to send / Shift+Enter for newline, char counter, embedded QuotaPill
- [x] Composer disabled when `isReadOnly`, archived, or `remainingCalls <= 0`
- [x] `useSendMessage` invalidates `billing.quota` (pill ticks down)
- [x] `409 CONVERSATION_ARCHIVED` → toast + composer locked via `disabledReason`
- [x] Two-click confirm on hard delete
- [x] Sidebar nav item ("AI Chat") between My Summary and Task Explorer
- [ ] **Missing**: top-bar / floating-action-button entry points on dashboard / my-summary pages
- [ ] **Missing**: composer hide when user lacks `ai:use` permission (currently only `isReadOnly` and quota are checked)

---

## 8. Uploads — `purpose` enum compliance

- [~] [services/uploads.service.ts](services/uploads.service.ts) hardcodes `purpose: "signature"` only
- [ ] Expand the `purpose` enum type to `'signature' | 'task_attachment' | 'task_document' | 'announcement_image' | 'general'`
- [ ] Audit callers and pass the correct `purpose` (avatars, signatures, task attachments, announcement images)
- [ ] Use returned `upload.headers` instead of invented headers (current code may be OK; needs verification)

---

## 9. Endpoint surfaces — drift audit

- [ ] Employees — verify `status: current | past | planned`, `roleId`, `dbsNumber`, `dbsDate` fields
- [ ] Homes — confirm sub-resources mounted (`/summary`, `/events`, `/shifts`, all `/reports/*`)
- [ ] Young People — confirm sensitive fields gate on `young_people:sensitive_read`
- [ ] Vehicles — confirm `sortBy` enum matches spec
- [ ] Tasks — verify `taskRef`, `formGroup`, `lifecycleStatusLabel`, `approvalStatus`, `labels` are in the type. Confirm batch endpoints wired.
- [ ] Daily logs — verify `relatesTo: { type, id }` shape. **DELETE is hard.**
- [ ] Forms — verify `builder`, `access`, `triggerTask`, `notifications` nested shapes
- [ ] Documents — `visibility` enum (`private | tenant | home`). DELETE is hard.
- [ ] Audit — wire `/audit/security-alerts?lookbackHours=` into a widget
- [ ] Reports — verify Reg44/Reg45 packs + RI dashboard pages exist (gated on `reports:read`)
- [ ] Safeguarding — verify chronologies + patterns + risk alerts pages render
- [ ] Sensitive data — verify access is auto-logged; DELETE is hard
- [ ] Help center — FAQs + tickets with comments
- [ ] Notifications — verify `unread-count` for badge; `read-all` for bulk
- [ ] Exports — verify async job pattern works end-to-end
- [ ] Settings — org + notifications
- [ ] Summary — verify approval batch endpoint
- [ ] Webhooks — verify create + test + deliveries log UI

---

## 10. Impersonation banner

- [x] `<ImpersonationBanner />` at [components/auth/impersonation-banner.tsx](components/auth/impersonation-banner.tsx)
- [x] Decodes JWT via `decodeAccessToken()` from [lib/auth/jwt.ts](lib/auth/jwt.ts)
- [x] Shows "Support session active · acting as <name>" + "End session" button (calls `logout()`)
- [x] Mounted above `<SubscriptionBanner />` in both dashboard layouts
- [ ] **Missing**: handle `401 IMPERSONATION_REVOKED` specifically (currently falls through to the generic logout path, which is fine but no custom messaging)
- [ ] **Missing**: hide self-mutating account flows (change password, MFA disable) while impersonating — server returns `IMPERSONATION_ACTIVE` 409 but FE could preempt

---

## 11. Suggested build order (historical — for reference)

1. ~~Infrastructure (§2) — error map, rate-limit helper, JWT decoder~~ Partial
2. ~~Subscription store + banner (§5)~~ ✅
3. ~~Billing service + Settings → Billing page (§6)~~ ✅
4. ~~Quota pill + AI 402 polish (§6c, §7a)~~ ✅
5. ~~Conversational AI page (§7b)~~ ✅
6. ~~Session-expiry warnings (§3e)~~ Pre-existing
7. ~~MFA Security card + backup-code link (§4)~~ ✅
8. Uploads `purpose` field audit (§8) — **next**
9. Endpoint-drift audits (§9) — **next**
10. ~~Impersonation banner (§10)~~ ✅

---

## 12. Acceptance criteria — what to test

End-to-end smoke tests. None of these require code changes anymore; they are user-test scenarios against the deployed FE + sandbox tenants.

- [ ] **Onboarding**: new owner registers → OTP verify → MFA enrollment QR + backup codes → land in dashboard with trial banner
- [ ] **Plan purchase**: trial banner CTA → `/settings/billing` → "Standard monthly" → Stripe test card → land on success page → banner clears within 60s
- [ ] **Top-up**: from billing page → "Top-up Small" → Stripe checkout → quota pill increases by 250 within 30s
- [ ] **Read-only mode**: tenant in `past_due_readonly` logs in → red banner visible → 5 sample mutation buttons disabled → "Update card" CTA opens portal
- [ ] **Conversational AI**: create chat → send 3 messages → quota ticks down by 3 → archive → unarchive → hard-delete with confirm
- [ ] **Session warning**: 14 min idle → modal appears → "Stay signed in" → counter resets
- [ ] **MFA backup**: on `/mfa-verify` click "Use a backup code" → enter 8+ char code → land in dashboard
- [ ] **Impersonation**: support session JWT → yellow banner appears → "End session" works → returns to login

---

## 13. Out of scope

- `/admin/*` platform admin routes (separate FE app)
- `/integrations/billing/webhook` and `/integrations/security-alerts/webhook` (server-to-server)
- Streaming responses for conversational AI — spec explicitly says no streaming
- `/public/*` marketing forms — owned by marketing site

---

## 14. Open questions for BE (Julius)

- [ ] Confirm `BILLING_CHECKOUT_SUCCESS_URL` / `BILLING_CHECKOUT_CANCEL_URL` / `BILLING_PORTAL_RETURN_URL` env values point to FE-controlled routes
- [ ] Add `canManageBilling`, `canUseAi`, `canAdminAi` to `/me/permissions` derived flags, or should FE compute from `tenantRole` + permissions list?
- [ ] Per-user quota breakdown (`perUserUsage[]`) — capped or full list? Affects FE pagination.
- [ ] `/auth/session-expiry` — recommended polling cadence? (We default to fetch-on-focus + computed-from-cache.)
- [ ] `/audit/security-alerts` — should this drive a dashboard widget, or only an alerts page?
- [ ] Reg44/Reg45 reports — confirm they return file streams for `format=pdf|excel|zip`; FE handles via `.blob()`
- [ ] **Critical**: does production `/auth/login` currently return the new discriminated union (with `challengeToken` / `enrollmentToken`) or the legacy envelope? Required before unblocking the `mfaEnrollmentRequired` login refactor.

---

## What's left — prioritised summary

Items 1–3 from the previous version are now ✅ done (gating sweep complete). Remaining work:

1. ~~**Forms publish/archive/clone read-only gate**~~ ✅ Done — inline `useIsReadOnly()` check on each DropdownMenuItem
2. ~~**Remaining mutation buttons**~~ ✅ Done — ~25 mutation surfaces retrofitted across users, scheduling, sensitive-data, task drawer, my-summary
3. ~~**AI button gating on `ai:use` permission**~~ ✅ Done — `<AskAiButton>` reads `user.aiAccessEnabled` and hides when false
4. **429 cooldown UI** (small) — countdown timer that disables submit buttons after a `TOO_MANY_REQUESTS` until `x-ratelimit-reset` expires; wire into a global cool-down store
5. **`BILLING_NOT_CONFIGURED` feature flag** (small) — app-boot probe to hide billing UI on dev envs where Stripe isn't set up
6. **Uploads `purpose` enum compliance** (medium) — expand the type, audit ~5 callers, pass correct `purpose`
7. **Central error map switch** (medium) — extract one place that maps error families to default UX side-effects
8. **Per-user AI restrictions table** (medium) — needs a user picker; bind to `perUserCaps` on `PUT /billing/ai-restrictions`
9. **AI chat entry points** (small) — top-bar icon + floating action button on dashboard / my-summary linking to `/ai`
10. **Endpoint-drift audit** (large, rolling) — verify each of the ~18 module shapes against the spec; one PR per module
11. **`mfaEnrollmentRequired` login branch** (large) — needs BE confirmation first, then refactor `authService.login` + `mfa-store` + `mfa-modal` + `/mfa-verify` to the new discriminated-union model
12. **Self-mutating account flow gates during impersonation** (small) — preempt 409 `IMPERSONATION_ACTIVE` on change-password and MFA-disable
