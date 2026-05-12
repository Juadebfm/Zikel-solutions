# Frontend Integration Plan — Checklist

Source spec: `zikel-solutions-BE/frontend-integration.md` (BE-authored, 2026-05-11).
Schema source of truth: Swagger UI at `/docs`.
Scope: tenant FE (`/api/v1/*`). Platform admin (`/admin/*`) is out of scope.

Last updated: 2026-05-12 (latest: endpoint-drift audit pass 2 — fixed 6 contract bugs across exports/reports/safeguarding/sensitive-data/summary; commit pending).

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
| Cross-cutting — central error map | ✅ Done — single `dispatchErrorSideEffects` switch in client.ts (MFA sync, billing-gate, rate-limit) | infra slice |
| Cross-cutting — rate-limit headers / cooldown store | ✅ Done — `stores/rate-limit-store.ts` + `useCooldown` + `<MutationButton cooldownFamily>` | infra slice |
| Cross-cutting — permission gating with spec names | ~ Partial — using `tenantRole` checks | `5197b18` |
| Uploads — `purpose` enum compliance | ✅ Done — full 5-value enum exposed; only existing caller (acknowledgements) already correct with `signature` | uploads slice |
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

- [x] Friendly messages added for the full spec error catalogue — see [lib/api/error.ts](lib/api/error.ts). Coverage:
  - Auth/token: `TENANT_TOKEN_REJECTED`, `PLATFORM_TOKEN_REJECTED`, `PLATFORM_ONLY`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `FORBIDDEN`, `PERMISSION_DENIED`
  - Sessions: `NO_REFRESH_TOKEN`, `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_INVALID`, `REFRESH_TOKEN_REUSED`, `SESSION_REVOKED`, `SESSION_IDLE_EXPIRED`, `SESSION_ABSOLUTE_EXPIRED`
  - Tenant: `TENANT_CONTEXT_REQUIRED`, `TENANT_ACCESS_DENIED`, `TENANT_INACTIVE`, `TENANT_NOT_FOUND`, `USER_NOT_FOUND`
  - MFA: `MFA_REQUIRED`, `MFA_NOT_FOUND`, `MFA_ALREADY_CONFIRMED`, `MFA_CODE_INVALID`, `MFA_BACKUP_INVALID`, `MFA_CHALLENGE_INVALID`, `MFA_CHALLENGE_AUDIENCE`
  - Billing: `SUBSCRIPTION_PAST_DUE`, `SUBSCRIPTION_INCOMPLETE`, `SUBSCRIPTION_REQUIRED`, `BILLING_NOT_CONFIGURED`
  - AI: `AI_ACCESS_DISABLED`, `AI_DISABLED_FOR_TENANT`, `CONVERSATION_ARCHIVED`
  - Impersonation: `IMPERSONATION_ACTIVE`, `IMPERSONATION_REVOKED`, `INVALID_DURATION`
- [x] **Central side-effect switch** — `dispatchErrorSideEffects()` in [lib/api/client.ts](lib/api/client.ts) is the single place where MFA-sync / billing-gate / rate-limit cooldown side-effects fire. Each family has one handler, no scattering across consumers.

### 2b. Rate-limit headers & cooldown store

- [x] `parseRateLimitResetHeader()` helper in [lib/api/client.ts](lib/api/client.ts) reads `x-ratelimit-reset` (falls back to `retry-after`)
- [x] Global cool-down store at [stores/rate-limit-store.ts](stores/rate-limit-store.ts) keyed by route family (`auth`, `billing`, `ai`, …)
- [x] `useCooldown(family)` hook ticks every second via `useSyncExternalStore`; auto-clears stale entries
- [x] `<MutationButton cooldownFamily="ai">` reads cooldown, disables + shows "Try in Ns" countdown + tooltip
- [x] Applied to AI surfaces: `<MessageComposer>` send button + AI chat dialog Ask AI button
- [x] Applied to billing buttons: plan-switcher "Switch to this plan", top-up "Buy", current-plan "Manage card" (with `ignoreReadOnly`), cancel-subscription "Yes, cancel"
- [→] Login + OTP resend already have their own internal cooldown patterns (using `resendAvailableAt`); migrating to the global store would be a no-value rewrite

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
- [x] Dirty-state tracking (includes per-user diff)
- [x] **Per-user overrides table** — new `<PerUserCapsTable />` at [components/billing/per-user-caps-table.tsx](components/billing/per-user-caps-table.tsx). User picker driven by `useTenantMemberships`. Per-row mode (Uncapped/Capped/Disabled) + numeric cap + remove. Sends both `perRoleCaps` and `perUserCaps` on save.

### 6e. Return pages

- [x] `/settings/billing/success` — invalidates `billing.subscription`, `billing.quota`, `billing.invoicesBase` on mount, shows "thanks" + "go to dashboard"
- [x] Portal / checkout cancel return → `/settings/billing` (no separate page)
- [ ] **Open question for BE**: confirm `BILLING_CHECKOUT_SUCCESS_URL`, `BILLING_CHECKOUT_CANCEL_URL`, `BILLING_PORTAL_RETURN_URL` env values point to FE-controlled routes

### 6f. `BILLING_NOT_CONFIGURED` handling

- [x] `useIsBillingEnabled()` probe in [hooks/api/use-billing.ts](hooks/api/use-billing.ts) — derives from the subscription query error.
- [x] `<SubscriptionBanner />` returns null when billing isn't configured.
- [x] Settings page billing link card hidden when billing isn't configured.
- [x] Direct navigation to `/settings/billing` shows a "Billing not configured" card with back-to-dashboard CTA.

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
- [x] **429 cooldown** — `cooldownFamily="ai"` on Ask AI button + composer send. Button auto-disables with "Try in Ns" countdown when bucket is exhausted; auto-recovers when `x-ratelimit-reset` elapses.

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
- [x] **Top-bar icon** — Bot icon in [components/layout/header.tsx](components/layout/header.tsx) next to the Notifications bell. Visible only when `useCanUseAi()` is true. FAB intentionally skipped — three discovery paths (sidebar nav, header icon, inline `<AskAiButton>` on each list page) is sufficient.
- [x] **Page-level permission gate** — [app/(dashboard)/ai/page.tsx](app/(dashboard)/ai/page.tsx) checks `useCanUseAi()` at the top and renders a friendly "AI is not available for your account" card with a back-to-dashboard CTA when false. Sidebar, thread, and composer are skipped entirely.

---

## 8. Uploads — `purpose` enum compliance

- [x] [services/uploads.service.ts](services/uploads.service.ts) — `UploadPurpose` union type exported with the full spec set: `'signature' | 'task_attachment' | 'task_document' | 'announcement_image' | 'general'`
- [x] Optional `checksumSha256` added to `CreateUploadSessionInput` per spec §M19
- [x] Only existing caller is [acknowledgements/page.tsx](app/(dashboard)/acknowledgements/page.tsx) which already passes `purpose: "signature"` (still type-correct under new union)
- [x] Uses `upload.headers` from server response (not invented). Confirmed at line 562 of acknowledgements page.
- [ ] **When future uploads land** (avatar widget on employee step-summary, task attachments, announcement images, document uploads), use the appropriate `UploadPurpose`. The avatar widget on `components/employees/create/step-summary.tsx` currently stores the File locally without going through uploadsService — not in scope.

---

## 9. Endpoint surfaces — drift audit

Pass 1 covered 5 high-traffic modules (Employees, Homes, Young People, Tasks, Daily Logs):

### Audited and corrected
- [x] **Daily Logs (M15)** — ✅ no drift. `CreateDailyLogPayload`, response shapes, and the hard-DELETE behavior all match spec.
- [x] **Employees (M11)** — contract bug fixed: `userId` made required on `CreateEmployeeInput` (was optional, server would 422). Added optional fields from spec: `endDate`, `status: 'current'|'past'|'planned'`, `dbsNumber`, `dbsDate`, `qualifications`, `isActive`.
- [x] **Young People (M12)** — contract bug fixed: `homeId` made required on `CreateYoungPersonInput`. Added 15+ missing optional response fields: `preferredName`, `namePronunciation`, `type`, `ethnicity`, `religion`, `referenceNo`, `niNumber`, `roomNumber`, `placementEndDate`, `keyWorkerId`, `practiceManagerId`, `adminUserId`, `socialWorkerName`, `independentReviewingOfficer`, `placingAuthority`, `legalStatus`, `isEmergencyPlacement`, `isAsylumSeeker`, `contact`, `health`, `education`. Expanded `YoungPersonListParams` with `status`/`gender`/`type`. Updated `create-young-person-drawer.tsx` form validation to require `homeId`.
- [x] **Tasks (M14)** — `TaskEntityType` enum corrected: dropped `'document' | 'event'` (unsupported), added `'tenant' | 'care_group' | 'task'` per spec §M14.

### Documented for later (non-blocking — service methods nothing currently calls)
- [ ] **Homes** — missing service methods for sub-resources (`/homes/:id/{summary,young-people,employees,vehicles,tasks,events,shifts,reports/*}`) and `GET /homes/export`. Add when UI consumers land.
- [ ] **Employees** — `GET /employees/export` service method missing. Update interface gaps: `endDate`, `dbsNumber`, `dbsDate`, `qualifications`, `isActive` not in the current `UpdateEmployeeInput`. Add if/when the detail drawer adds those form fields.
- [ ] **Young People** — `GET /young-people/export` service method missing.
- [ ] **Tasks** — missing service methods: `GET /tasks/export`, `POST /tasks/batch-archive`, `POST /tasks/batch-postpone`, `POST /tasks/:id/postpone`, `POST /tasks/batch-reassign`. The Task Explorer batch toolbar already calls these via separate hooks — verify those hooks match the spec contract.

### Pass 2 — audited and corrected
- [x] **Documents (M17)** — ✅ no drift
- [x] **Settings (M34)** — ✅ no drift
- [x] **Exports (M24)** — contract bug fixed: added required `title` field to `CreateExportPayload`. Updated reports page caller to derive title from entity + date.
- [x] **Reports (M29)** — three contract bugs fixed: `tenantId` made required on all three params (was missing), field names remapped on wire (`dateFrom`/`dateTo` → `startDate`/`endDate`). Updated `useReg44Pack`/`useReg45Pack`/`useRiDashboard`/`useRiDrilldown` hooks to gate on `Boolean(tenantId)`. Updated `EvidencePacksTab` and `RiDashboardTab` to source `tenantId` from auth context.
- [x] **Safeguarding (M32)** — two contract bugs fixed: `evaluateRiskAlerts` now accepts `mode` + `lookbackHours` body (was sending empty); `addRiskAlertNote` sends `{ content }` per spec (was sending `{ note }`).
- [x] **Sensitive Data (M33)** — added `description?` + `expiryDate?` fields to `CreateSensitiveRecordPayload`. Kept existing FE-only fields (`title`, `confidentialityScope`, etc.) as-is.
- [x] **Summary (M35)** — two contract bugs fixed: `ReviewEventPayload.action` enum trimmed to spec's 3 values (was including `'review' | 'acknowledge'` which would 422); `BatchProcessPayload` now exposes `comment?` per spec (kept `rejectionReason?` as deprecated alias).

### Pass 2 — documented gaps (non-blocking, no UI consumer)
- [ ] **Vehicles** — `VehicleListParams` missing `sortBy` / `sortOrder` query params per spec §M13. Add when sort UI lands.
- [ ] **Care Groups** — minor cosmetic drift: spec uses `country`, FE uses `countryRegion`. Verify with BE before changing — could break existing data.
- [ ] **Forms** — `FormMetadata` missing `statuses` / `formGroups` / `triggerOptions` fields per spec §M18. Add when form-builder UI surfaces dropdowns.
- [ ] **Notifications (M27)** — no dedicated service file exists. Spec endpoints (`/notifications`, `/unread-count`, `/read-all`, `/preferences`) not implemented in FE. Build when notification inbox surface is added.
- [ ] **Webhooks (M36)** — no service file. Build when customer-webhook management UI lands.

---

## 10. Impersonation banner

- [x] `<ImpersonationBanner />` at [components/auth/impersonation-banner.tsx](components/auth/impersonation-banner.tsx)
- [x] Decodes JWT via `decodeAccessToken()` from [lib/auth/jwt.ts](lib/auth/jwt.ts)
- [x] Shows "Support session active · acting as <name>" + "End session" button (calls `logout()`)
- [x] Mounted above `<SubscriptionBanner />` in both dashboard layouts
- [x] **`useIsImpersonating()` hook** at [hooks/use-impersonation.ts](hooks/use-impersonation.ts) — read JWT for `impersonatorId`
- [x] **Self-mutating account flows gated** — MFA Security Card disables Set up / Regenerate backup codes / Disable 2FA when impersonating, with an explanatory yellow notice. Server still enforces `IMPERSONATION_ACTIVE` 409.
- [x] **`IMPERSONATION_REVOKED` friendly message** — "Your support session was ended. Please sign in again." surfaces wherever `getApiErrorMessage` is used. The existing logout path handles cleanup.
- [ ] **Missing**: Change-password UI doesn't exist yet — when added, gate it the same way (no diff today)

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

Items 1–5 and 7 are now ✅ done. Remaining work:

1. ~~**Forms publish/archive/clone read-only gate**~~ ✅
2. ~~**Remaining mutation buttons**~~ ✅
3. ~~**AI button gating on `ai:use` permission**~~ ✅
4. ~~**429 cooldown UI**~~ ✅ — `useCooldown` hook + `<MutationButton cooldownFamily>` prop
5. ~~**`BILLING_NOT_CONFIGURED` feature flag**~~ ✅ — `useIsBillingEnabled` probe, banner + settings link + billing page all gated
6. ~~**Uploads `purpose` enum compliance**~~ ✅ — full union exposed; existing caller correct; future callers documented
7. ~~**Central error map switch**~~ ✅ — `dispatchErrorSideEffects()` in client.ts is the single dispatch for MFA-sync / billing-gate / rate-limit reactions
8. ~~**Per-user AI restrictions table**~~ ✅ — user picker + table wired; saves `perRoleCaps` + `perUserCaps` together
9. ~~**AI chat entry points**~~ ✅ — top-bar Bot icon in header (FAB skipped as redundant)
10. ~~**Endpoint-drift audit**~~ ✅ Pass 1 + Pass 2 complete. Fixed 9 contract bugs across employees, young-people, tasks, exports, reports, safeguarding, sensitive-data, summary. Documented non-blocking gaps in vehicles, care-groups, forms, notifications, webhooks.
11. **`mfaEnrollmentRequired` login branch** (large) — needs BE confirmation first, then refactor `authService.login` + `mfa-store` + `mfa-modal` + `/mfa-verify` to the new discriminated-union model
12. ~~**Self-mutating account flow gates during impersonation**~~ ✅ — `useIsImpersonating()` hook + MFA Security Card buttons disabled during support sessions
13. ~~**Opt-in rate-limit cooldown on more surfaces**~~ ✅ — billing buttons now opt in via `cooldownFamily="billing"`; login/OTP keep their existing patterns
14. ~~**Friendly messages for tail error codes**~~ ✅ — full spec catalogue mapped in lib/api/error.ts
