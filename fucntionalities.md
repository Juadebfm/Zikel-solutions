# Functionalities (Phase 1 Scope)

## Coverage
This document lists the starting functional scope from custom signup/auth through:
- My Summary page
- My Dashboard page

## 1) Custom Auth and Signup Functionalities

### 1.1 Signup (4-step flow)
- [ ] Step 1: Country of residence selection (UK or Nigeria).
- [ ] Step 2: Basic profile capture (first name, middle name, surname, gender, email, phone).
- [ ] Step 3: Password setup with policy checks:
  - [ ] Minimum 8 characters
  - [ ] Uppercase
  - [ ] Lowercase
  - [ ] Number
  - [ ] Special character
  - [ ] Confirm password match
  - [ ] Accept terms required
- [ ] Step 4: OTP verification flow:
  - [ ] 6-digit code entry
  - [ ] OTP resend with cooldown
  - [ ] OTP paste support
  - [ ] Clear invalid/expired code handling
- [ ] Successful OTP verification creates account.
- [ ] Auto-login after successful verification (fallback to login page if auto-login fails).

### 1.2 Login
- [ ] Email + password authentication.
- [ ] Validation and user-friendly error states.
- [ ] Remember/restore session behavior.
- [ ] Redirect authenticated users to `/my-summary`.
- [ ] Redirect unauthenticated access to protected routes back to `/login`.

### 1.3 Session and Logout
- [ ] Session persistence (currently frontend local storage; backend should support secure token/session model).
- [ ] Session expiry handling.
- [ ] Logout endpoint + client state clear + redirect to login.

### 1.4 Role and Permission Model
- [ ] Roles: `staff`, `manager`, `admin`.
- [ ] Permission-driven access checks (e.g., approvals, reports, settings, export, user management).
- [ ] Role-based navigation visibility.
- [ ] Permission guard behavior for restricted actions:
  - [ ] show access banner
  - [ ] block action
  - [ ] open no-permission modal

## 2) My Summary Page Functionalities (`/my-summary`)

### 2.1 Header and User Context
- [ ] Show welcome text with current user name.
- [ ] Display page-level actions (New Task, Ask AI placeholders).

### 2.2 Stats Overview
- [ ] Show summary metric cards (overdue, due today, pending approval, rejected, draft, future, comments, rewards, etc.).
- [ ] Card links route to filtered task/calendar pages.

### 2.3 To Do List Panel
- [ ] Render personal task list.
- [ ] Show task ID, title, relation, status, assignee, due date.
- [ ] View task action per row.

### 2.4 Tasks To Approve Panel
- [ ] Render approval queue with pagination.
- [ ] View task action.
- [ ] Approve action (permission-controlled).
- [ ] Process batch action (permission-controlled).

### 2.5 Provisions Section
- [ ] Group by home.
- [ ] Show today's events per home.
- [ ] Show today’s staff shifts per home.

### 2.6 Access-Control UX
- [ ] Show view-only banner for users lacking approval permission.
- [ ] Block protected actions and show permission modal.

## 3) My Dashboard Functionalities (`/my-dashboard`)

### 3.1 Dashboard Header
- [ ] Display dashboard heading and description.
- [ ] Export menu (PDF/Excel action placeholders).

### 3.2 Stats Overview Block
- [ ] Display the same/high-level KPI cards used for quick overview.

### 3.3 Widgets Area
- [ ] List saved widgets.
- [ ] Empty state when no widgets exist.
- [ ] Remove widget from dashboard.

### 3.4 Add Widget Flow
- [ ] Widget type selection page (`/my-dashboard/widgets`).
- [ ] Configure widget page (`/my-dashboard/widgets/configure?type=...`).
- [ ] Widget fields:
  - [ ] Card title
  - [ ] Period
  - [ ] Reports on
- [ ] Save widget and return to dashboard.

### 3.5 Widget Persistence
- [ ] Persist widget configuration (currently local storage).
- [ ] Load persisted widgets on page load.

## 4) Backend Functional Requirements to Support This Scope

### 4.1 Auth APIs
- [ ] `POST /auth/register`
- [ ] `POST /auth/verify-otp`
- [ ] `POST /auth/resend-otp`
- [ ] `POST /auth/login`
- [ ] `POST /auth/logout`
- [ ] `GET /auth/me`

### 4.2 Summary APIs
- [ ] `GET /summary/stats`
- [ ] `GET /summary/todos`
- [ ] `GET /summary/tasks-to-approve`
- [ ] `POST /summary/tasks-to-approve/:id/approve`
- [ ] `POST /summary/tasks-to-approve/process-batch`
- [ ] `GET /summary/provisions`

### 4.3 Dashboard APIs
- [ ] `GET /dashboard/stats`
- [ ] `GET /dashboard/widgets`
- [ ] `POST /dashboard/widgets`
- [ ] `DELETE /dashboard/widgets/:id`

### 4.4 Access Control Rules
- [ ] Enforce permissions server-side for all protected actions.
- [ ] Return consistent authorization errors for UI handling.

## 5) Acceptance Criteria (Initial)
- [ ] User can register, verify OTP, and land in authenticated experience.
- [ ] User can login/logout reliably with valid session handling.
- [ ] My Summary loads user-specific stats, tasks, and provisions.
- [ ] Restricted users cannot execute protected approval actions.
- [ ] My Dashboard can create, list, and delete widgets via backend APIs.
