# Nexus TOS — Zikel Solutions

An enterprise-grade care management platform built with Next.js 16. This frontend application powers the Zikel Solutions ecosystem — managing care homes, young people, employees, vehicles, tasks, daily logs, and more — with multi-tenant support, role-based access control, AI-powered assistance, and full internationalization.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Routing](#routing)
- [Authentication & Authorization](#authentication--authorization)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Components](#components)
- [Services](#services)
- [Custom Hooks](#custom-hooks)
- [Type System](#type-system)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Scripts](#scripts)
- [Key Features](#key-features)

---

## Tech Stack

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Framework        | Next.js 16.1.6 (App Router)                     |
| Language         | TypeScript 5 (strict mode)                       |
| UI Primitives    | Radix UI + shadcn/ui (New York style)            |
| Styling          | Tailwind CSS 4 with PostCSS                      |
| Client State     | Zustand 5                                        |
| Server State     | TanStack React Query 5                           |
| Tables           | TanStack React Table 8                           |
| Forms            | React Hook Form 7 + Zod 4                        |
| Charts           | Recharts 2                                       |
| Icons            | Lucide React                                     |
| Animations       | Framer Motion 12                                 |
| Fonts            | Geist Sans & Geist Mono (via next/font)          |
| Testing          | Vitest 4                                         |
| Linting          | ESLint 9 (Next.js core web vitals)               |

---

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm (ships with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/Zikel-solutions.git
cd Zikel-solutions

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app auto-updates as you edit files.

### Production

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for reference):

| Variable                    | Required | Default                                          | Description                                       |
| --------------------------- | -------- | ------------------------------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`  | Yes      | `https://zikel-solutions-be-kpotja.fly.dev`      | Backend API origin                                |
| `NEXT_PUBLIC_APP_URL`       | No       | `https://app.zikel.com`                           | Frontend URL used for generating invite links     |
| `NEXT_PUBLIC_TERMS_URL`     | No       | Falls back to `/terms`                            | External terms of service page URL                |
| `NEXT_PUBLIC_PRIVACY_URL`   | No       | Falls back to `/privacy`                          | External privacy policy page URL                  |

All variables use the `NEXT_PUBLIC_` prefix and are exposed in the client bundle.

---

## Project Structure

```
Zikel-solutions/
├── app/                        # Next.js App Router pages & layouts
│   ├── (auth)/                 # Auth route group (public pages)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── mfa-verify/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── activate/
│   │   ├── join/[code]/
│   │   ├── pending-approval/
│   │   ├── terms/
│   │   ├── privacy/
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── (dashboard)/            # Dashboard route group (protected pages)
│   │   ├── my-summary/
│   │   ├── my-dashboard/
│   │   ├── tasks/
│   │   ├── announcements/
│   │   ├── daily-logs/
│   │   ├── calendar/
│   │   ├── forms/
│   │   ├── young-people/
│   │   ├── homes/
│   │   ├── care-groups/
│   │   ├── employees/
│   │   ├── vehicles/
│   │   ├── rotas/
│   │   ├── regions/
│   │   ├── groupings/
│   │   ├── documents/
│   │   ├── uploads/
│   │   ├── bulk-exports/
│   │   ├── reports/
│   │   ├── audit/
│   │   ├── users/
│   │   ├── sensitive-data/
│   │   ├── settings/
│   │   ├── system-settings/
│   │   ├── invites/
│   │   ├── acknowledgements/
│   │   ├── onboarding/
│   │   ├── help/
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── layout.tsx              # Root layout (providers)
│   ├── page.tsx                # Home page (auth redirect)
│   └── not-found.tsx           # Global 404 page
│
├── components/                 # React component library (~104 components)
│   ├── ui/                     # 26 shadcn/ui base primitives
│   ├── auth/                   # Auth forms & signup steps
│   ├── dashboard/              # Dashboard widgets & stats
│   ├── task-explorer/          # Task management UI
│   ├── employees/              # Employee management
│   ├── homes/                  # Care home management
│   ├── young-people/           # Young people tracking
│   ├── vehicles/               # Vehicle management
│   ├── daily-logs/             # Daily log components
│   ├── care-groups/            # (via pages)
│   ├── layout/                 # Sidebar, header, mobile nav
│   ├── shared/                 # Global: AI chat, toast, loaders, errors
│   ├── mfa/                    # MFA modal & banner
│   ├── form-designer/          # Dynamic form builder
│   └── permission/             # Permission guards & banners
│
├── services/                   # API service layer (18 services)
├── hooks/                      # Custom React hooks (18 hooks)
│   └── api/                    # Data-fetching hooks (React Query)
├── lib/                        # Core utilities & configuration
│   ├── api/                    # HTTP client, config, error handling
│   ├── auth/                   # OTP & RBAC utilities
│   ├── config/                 # Legal page config
│   ├── constants.ts            # App-wide constants
│   ├── query-keys.ts           # React Query key factory
│   ├── utils.ts                # General utilities
│   └── validators.ts           # Zod validation schemas
│
├── stores/                     # Zustand state stores
├── contexts/                   # React context providers
├── types/                      # Centralized TypeScript definitions
├── providers/                  # React Query provider
├── config/                     # Navigation config
├── data/                       # Static data (widget options)
├── i18n/                       # Translation files (EN/FR)
├── tests/                      # Integration tests (Vitest)
└── public/                     # Static assets (logos, favicons)
```

---

## Architecture Overview

This application is a **frontend-only Next.js client**. There are no API routes or database connections in this repository. All business logic, data persistence, and auth verification are handled by the external backend API.

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                     │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌─────────────────────┐  │
│  │  Pages    │──>│Components│──>│  UI Primitives       │  │
│  │ (Routes)  │   │(Feature) │   │  (Radix/shadcn)      │  │
│  └────┬─────┘   └────┬─────┘   └─────────────────────┘  │
│       │               │                                   │
│  ┌────▼───────────────▼─────┐                            │
│  │    Custom Hooks           │                            │
│  │  (React Query wrappers)   │                            │
│  └────────────┬──────────────┘                            │
│               │                                           │
│  ┌────────────▼──────────────┐   ┌─────────────────────┐ │
│  │    Services Layer          │   │   Zustand Stores     │ │
│  │  (API endpoint wrappers)   │   │  (Client state)      │ │
│  └────────────┬──────────────┘   └─────────────────────┘ │
│               │                                           │
│  ┌────────────▼──────────────┐                            │
│  │    API Client (lib/api)    │                            │
│  │  - Token management        │                            │
│  │  - MFA interception        │                            │
│  │  - Error handling          │                            │
│  └────────────┬──────────────┘                            │
└───────────────┼──────────────────────────────────────────┘
                │ HTTPS (REST)
┌───────────────▼──────────────────────────────────────────┐
│              Backend API (Fly.dev)                         │
│         /api/v1 — Auth, CRUD, AI, Uploads                 │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Pages** render feature **Components**
2. Components call **Custom Hooks** (React Query) for data
3. Hooks delegate to **Services** for API calls
4. Services use the centralized **API Client** with automatic token injection, refresh, and MFA gating
5. **Zustand Stores** manage ephemeral client state (auth session, MFA, task filters)
6. **React Contexts** provide global auth state and language preferences

---

## Routing

The app uses Next.js **Route Groups** to separate public and protected areas.

### Auth Routes — `(auth)/`

Publicly accessible pages for authentication flows.

| Route                  | Description                         |
| ---------------------- | ----------------------------------- |
| `/login`               | Email + password login              |
| `/register`            | Multi-step signup form              |
| `/verify-email`        | OTP email verification              |
| `/mfa-verify`          | Multi-factor authentication         |
| `/forgot-password`     | Password recovery request           |
| `/reset-password`      | Password reset form                 |
| `/activate`            | Staff account activation            |
| `/join/[code]`         | Accept organization invite via link |
| `/pending-approval`    | Account awaiting admin approval     |
| `/terms`               | Terms of service                    |
| `/privacy`             | Privacy policy                      |

### Dashboard Routes — `(dashboard)/`

Protected pages requiring authentication. Users are redirected to `/login` if unauthenticated.

| Route                              | Description                          |
| ---------------------------------- | ------------------------------------ |
| `/my-summary`                      | Main landing — stats, tasks, AI chat |
| `/my-summary/due-today`            | Tasks due today                      |
| `/my-summary/overdue-tasks`        | Overdue tasks                        |
| `/my-summary/todos`                | Personal to-do items                 |
| `/my-dashboard`                    | Customizable performance dashboard   |
| `/my-dashboard/widgets`            | Widget management                    |
| `/my-dashboard/widgets/configure`  | Widget configuration                 |
| `/tasks`                           | Task explorer with filtering         |
| `/announcements`                   | Announcements list                   |
| `/announcements/[id]`              | Announcement detail                  |
| `/daily-logs`                      | Daily activity logs                  |
| `/calendar`                        | Calendar view                        |
| `/forms`                           | Dynamic form management              |
| `/young-people`                    | Young people directory               |
| `/homes`                           | Care homes management                |
| `/care-groups`                     | Care groups list                     |
| `/care-groups/[id]`                | Care group detail                    |
| `/employees`                       | Employee directory                   |
| `/vehicles`                        | Vehicle fleet management             |
| `/rotas`                           | Staff schedule/rota management       |
| `/regions`                         | Regional management                  |
| `/groupings`                       | Data groupings                       |
| `/documents`                       | Document management                  |
| `/uploads`                         | File uploads                         |
| `/bulk-exports`                    | Bulk data export                     |
| `/reports`                         | Report generation                    |
| `/audit`                           | Audit logs & security events         |
| `/users`                           | User management                      |
| `/sensitive-data`                  | Sensitive data access                |
| `/settings`                        | Personal account settings            |
| `/system-settings`                 | System-wide configuration            |
| `/acknowledgements`               | Approval acknowledgement gate        |
| `/invites/accept`                  | Accept organization invites          |
| `/onboarding/create-organization`  | Organization setup wizard            |
| `/help`                            | Help center                          |

---

## Authentication & Authorization

Authentication is handled entirely **client-side** via the `AuthProvider` context (`contexts/auth-context.tsx`). There is no Next.js middleware.

### Authentication Flow

```
Login → Email Verification (if required) → MFA Challenge (if enabled)
  → Tenant Selection (if multi-tenant) → Acknowledgements Gate → Dashboard
```

### Session Management

- Cookie-backed refresh sessions (`credentials: "include"` on API calls)
- `accessToken` kept in memory only (not persisted to localStorage/sessionStorage)
- Automatic one-time access-token retry on `FST_JWT_AUTHORIZATION_TOKEN_EXPIRED`
- Logout forced on terminal 401 auth codes: `SESSION_IDLE_EXPIRED`, `SESSION_ABSOLUTE_EXPIRED`, `REFRESH_TOKEN_INVALID`
- Session countdown uses backend timestamps: `serverTime`, `idleExpiresAt`, `absoluteExpiresAt`, `warningWindowSeconds`

### Multi-Factor Authentication (MFA)

- Email-based 6-digit OTP verification
- MFA gate blocks all write operations (POST, PATCH, PUT, DELETE) until verified
- Pending requests are automatically retried after successful MFA
- Global `<MfaModal />` component overlays the dashboard when triggered

### Role-Based Access Control (RBAC)

Defined in `lib/auth/rbac.ts`.

**Global Roles** (hierarchical):

| Role           | Description                       |
| -------------- | --------------------------------- |
| `super_admin`  | Full platform access              |
| `admin`        | Full administrative access        |
| `manager`      | View all records, approve logs    |
| `staff`        | Minimal permissions               |

**Tenant Roles**:

| Role            | Description                                     |
| --------------- | ----------------------------------------------- |
| `tenant_admin`  | Full write access regardless of global role     |
| `sub_admin`     | Extended access within the tenant               |
| `staff`         | Standard tenant-level access                    |

Permissions are checked via `hasPermission()` and `isRole()` methods provided by the auth context.

### Multi-Tenant Support

- Users can belong to multiple organizations (tenants)
- Tenant switching via `switchTenant()` in the auth context
- Membership statuses: `active`, `pending_approval`
- Invite links and direct invitations for onboarding

---

## State Management

### Server State — TanStack React Query

Configured in `providers/query-provider.tsx`:

- **Stale time**: 5 minutes
- **Retry**: 1 attempt on failure
- **Refetch on window focus**: Disabled

Query keys are centralized in `lib/query-keys.ts` with a factory pattern for consistent cache invalidation.

### Client State — Zustand Stores

| Store                          | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `auth-session-store.ts`       | User session, tokens, permissions, activity  |
| `mfa-store.ts`                | MFA modal state, pending write tracking      |
| `task-explorer-store.ts`      | Task filter/search state                     |
| `create-employee-store.ts`    | Multi-step employee creation form            |

### React Contexts

| Context                    | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `auth-context.tsx`         | Global auth state, permissions, methods |
| `language-context.tsx`     | i18n language switching (EN/FR)         |

---

## API Integration

### API Client (`lib/api/`)

The centralized HTTP client (`lib/api/client.ts`) handles:

- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` with `/api/v1` prefix
- **Timeout**: 90 seconds per request
- **Token injection**: Automatic `Authorization: Bearer` header
- **Token refresh**: Transparent 401 retry with refreshed token
- **MFA interception**: Detects MFA-required responses and triggers the modal
- **Error handling**: Custom `ApiClientError` class with friendly messages
- **FormData support**: For file uploads

### Response Types (`lib/api/types.ts`)

```typescript
ApiSuccess<T, M> = { success: true; data: T; meta?: M }
ApiFailure       = { success: false; error: { code, message, details } }
ApiMeta          = { total, page, pageSize, totalPages }
```

### Error Codes

The client handles these error codes with user-friendly messages:

`EMAIL_TAKEN` | `OTP_INVALID` | `OTP_COOLDOWN` | `INVALID_CREDENTIALS` | `ACCOUNT_LOCKED` | `ACCOUNT_INACTIVE` | `REFRESH_TOKEN_INVALID` | `MFA_REQUIRED` | `TENANT_ACCESS_DENIED`

---

## Components

Approximately **104 components** organized by domain:

### Base UI (`components/ui/`) — 26 components

Radix UI primitives styled with Tailwind CSS via shadcn/ui:

`avatar` | `badge` | `button` | `calendar` | `card` | `chart` | `checkbox` | `command` | `dialog` | `dropdown-menu` | `form` | `input` | `label` | `popover` | `radio-group` | `scroll-area` | `select` | `separator` | `sheet` | `sidebar` | `skeleton` | `switch` | `table` | `tabs` | `textarea` | `tooltip`

### Feature Components

| Directory          | Count | Description                                      |
| ------------------ | ----- | ------------------------------------------------ |
| `auth/`            | 12    | Login, signup (multi-step), OTP, password forms  |
| `dashboard/`       | 8     | Stats cards, widgets, approvals, todos           |
| `task-explorer/`   | 10    | Task table, filters, detail drawer, stepper      |
| `employees/`       | 8     | Employee CRUD, multi-step creation, audit        |
| `homes/`           | 5     | Home tabs, settings, audit with diff panel       |
| `vehicles/`        | 5     | Vehicle CRUD, custom fields, audit               |
| `young-people/`    | 5     | Profile tabs, outcome stars, rewards             |
| `daily-logs/`      | 3     | Log table, creation dialog, detail view          |
| `layout/`          | 3     | Sidebar, header, mobile navigation               |
| `shared/`          | 7     | AI chat, toast, loaders, error banners           |
| `mfa/`             | 2     | MFA modal and verification banner                |
| `form-designer/`   | 2     | Form builder shell and list table                |
| `permission/`      | 3     | Access banners, no-permission modal, guard hook  |

### Component Patterns

- **Client components**: All interactive components use the `"use client"` directive
- **Variant styling**: Class Variance Authority (CVA) for component variants
- **Multi-step forms**: Step indicator + individual step components
- **Tables**: TanStack React Table with pagination, sorting, and skeleton loaders
- **Dialogs**: Radix Dialog wrappers with header/content/footer structure

---

## Services

The services layer (`services/`) wraps all backend API endpoints:

| Service                      | Endpoints                                           |
| ---------------------------- | --------------------------------------------------- |
| `auth.service.ts`            | Login, register, refresh, MFA, password reset       |
| `ai.service.ts`              | AI assistant queries with page context               |
| `summary.service.ts`         | Dashboard stats, todos, task approvals, provisions   |
| `dashboard.service.ts`       | Dashboard widgets CRUD, stats retrieval              |
| `tasks.service.ts`           | Task CRUD, status workflows, filtering               |
| `announcements.service.ts`   | Announcement list, read/unread, details              |
| `daily-logs.service.ts`      | Daily log CRUD with IOI structure                    |
| `forms.service.ts`           | Form templates and submissions                       |
| `employees.service.ts`       | Employee CRUD, job titles, employment types          |
| `young-people.service.ts`    | Young people CRUD, rewards, outcome stars            |
| `homes.service.ts`           | Home listing, settings, audit trails                 |
| `care-groups.service.ts`     | Care group CRUD, stakeholder management              |
| `vehicles.service.ts`        | Vehicle CRUD, custom info fields                     |
| `tenants.service.ts`         | Invitations, invite links, memberships               |
| `audit.service.ts`           | Audit events, security alerts                        |
| `uploads.service.ts`         | S3-signed upload sessions, SHA256 checksums          |
| `backend-data.service.ts`    | Generic backend data fetching                        |
| `public.service.ts`          | Book demo, waitlist, contact forms                   |

---

## Custom Hooks

### API Hooks (`hooks/api/`)

Each hook wraps a service with TanStack React Query for caching, deduplication, and automatic refetching:

| Hook                    | Service               | Key Operations                    |
| ----------------------- | --------------------- | --------------------------------- |
| `use-dashboard.ts`      | Dashboard             | Stats, widget CRUD                |
| `use-ai.ts`             | AI                    | Ask AI mutation                   |
| `use-summary.ts`        | Summary               | Stats, todos, approvals           |
| `use-tasks.ts`          | Tasks                 | Task queries and mutations        |
| `use-announcements.ts`  | Announcements         | List and detail queries           |
| `use-daily-logs.ts`     | Daily Logs            | Log CRUD                          |
| `use-forms.ts`          | Forms                 | Form data and submission          |
| `use-employees.ts`      | Employees             | Employee queries                  |
| `use-young-people.ts`   | Young People          | Young people queries              |
| `use-homes.ts`          | Homes                 | Home queries                      |
| `use-care-groups.ts`    | Care Groups           | Care group queries                |
| `use-audit.ts`          | Audit                 | Events and security alerts        |
| `use-tenants.ts`        | Tenants               | Memberships and invites           |
| `use-backend-data.ts`   | Backend Data          | Generic data queries              |
| `use-public.ts`         | Public                | Public form submissions           |
| `use-dropdown-data.ts`  | Multiple              | Reusable select option queries    |

### UI Hooks

| Hook                | Description                                    |
| ------------------- | ---------------------------------------------- |
| `use-mobile.ts`     | Responsive breakpoint detection (768px)        |
| `use-form-steps.ts` | Multi-step form navigation and state           |

---

## Type System

Centralized in `types/` and re-exported from `types/index.ts`.

### `types/auth.ts`

- `UserRole` — `staff` | `manager` | `admin` | `super_admin`
- `TenantRole` — `tenant_admin` | `sub_admin` | `staff`
- `User` — Full user profile interface
- `AuthSessionContext` — Session with tenant memberships
- `RolePermissions` — Per-role permission mapping
- Signup, login, OTP, and password form types

### `types/common.ts`

- `Language` — `en` | `fr`
- `SelectOption<T>` — Generic dropdown option
- `CountryOption` — Country with flag and phone code
- `ApiResponse<T>` / `PaginatedResponse<T>` — API response wrappers
- Navigation, form step, and status variant types

### `types/dashboard.ts`

Domain model interfaces for all entities:

- **Young Person** — Status, type, gender, key worker info
- **Home** — Address, capacity, occupancy, manager
- **Care Group** — Type (private/public/charity), stakeholders
- **Employee** — Job title, employment type, status
- **Vehicle** — Registration, make/model, service dates
- **Task** — Status, priority, assignments, categories
- **IOI Log** — Input/Output/Impact for intervention tracking
- **Outcome Stars & Rewards** — Young person assessment and incentives
- **Settings & Audit** — 30+ configurable categories per entity

---

## Internationalization

The app supports **English** and **French** via a custom `LanguageProvider` context.

| File         | Description               |
| ------------ | ------------------------- |
| `i18n/en.json` | English translations   |
| `i18n/fr.json` | French translations    |

Translations cover: UI labels, form fields, validation messages, status labels, navigation items, and legal content.

Language selection is available on auth pages via the `<LanguageSelector />` component.

---

## Testing

The project uses **Vitest** for testing.

```bash
# Run all tests
npm test

# Run integration tests only
npm run test:integration
```

**Configuration** (`vitest.config.ts`):
- Environment: Node
- Test files: `tests/**/*.test.ts`
- Focus: Integration tests

---

## Scripts

| Script               | Command                            | Description                |
| -------------------- | ---------------------------------- | -------------------------- |
| `npm run dev`        | `next dev`                         | Start dev server           |
| `npm run build`      | `next build`                       | Production build           |
| `npm start`          | `next start`                       | Start production server    |
| `npm run lint`       | `eslint`                           | Run ESLint                 |
| `npm test`           | `vitest run`                       | Run all tests              |
| `npm run test:integration` | `vitest run tests/integration` | Run integration tests  |

---

## Key Features

### 1. Care Management
- **Young People** — Profile tracking with status (current/past/planned), key worker assignments, outcome star assessments, and reward systems
- **Care Homes** — Facility management with capacity tracking, occupancy, manager contacts, and configurable settings
- **Care Groups** — Organizational groupings (private/public/charity) with stakeholder management

### 2. Workforce Management
- **Employees** — Staff directory with multi-step onboarding, role assignments, job titles, employment types, and audit trails
- **Rotas** — Staff schedule and rotation management
- **Vehicles** — Fleet management with registration details, service tracking, and custom fields

### 3. Task & Activity Tracking
- **Task Explorer** — Full-featured task management with filtering by period, type, status, priority, and assignee
- **Daily Logs** — Structured IOI (Input/Output/Impact) logging for care interventions with 15+ techniques (Active Listening, Trauma-Informed Care, etc.)
- **Acknowledgements** — Approval gate requiring users to acknowledge tasks before accessing the dashboard

### 4. Communication & Reporting
- **Announcements** — System-wide announcements with read/unread tracking
- **Reports** — Report generation and data analysis
- **Bulk Exports** — Batch data export functionality
- **Audit Logs** — Comprehensive event tracking and security alert monitoring

### 5. AI Assistant
- In-app AI chat dialog with context-aware suggestions
- Supports 10+ page contexts (summary, tasks, care groups, homes, employees, vehicles, etc.)
- Returns structured responses with action suggestions

### 6. Dynamic Forms
- Form designer for building custom forms
- Template management and submission tracking
- 35+ built-in form types (Building Audit, Complaints, Medication Checks, etc.)

### 7. Document & File Management
- S3-signed upload sessions with SHA256 checksum verification
- Document management and organization
- Signature file support

### 8. Organization Management
- Multi-tenant architecture with organization switching
- Invite links and direct invitations
- Membership management with role assignment
- Organization onboarding wizard

### 9. Customizable Dashboard
- Configurable widgets for personal performance tracking
- Stats overview with color-coded cards
- Provisions tracking and linked organization views

---

## API Endpoints Reference

All endpoints are prefixed with the configured `NEXT_PUBLIC_API_BASE_URL` + `/api/v1`.

<details>
<summary>Click to expand full endpoint list</summary>

### Authentication
```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
POST   /auth/logout
POST   /auth/mfa/challenge
POST   /auth/mfa/verify
POST   /auth/switch-tenant
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/activate
```

### User Profile
```
GET    /me/profile
GET    /me/permissions
GET    /me/preferences
```

### Summary & Dashboard
```
GET    /summary/stats
GET    /summary/todos
GET    /summary/tasks-to-approve
GET    /summary/overdue-tasks
GET    /summary/provisions
GET    /dashboard/stats
GET    /dashboard/widgets
POST   /dashboard/widgets
DELETE /dashboard/widgets/:id
```

### Core Resources
```
GET/POST/PATCH/DELETE   /care-groups
GET/POST/PATCH/DELETE   /homes
GET/POST/PATCH/DELETE   /employees
GET/POST/PATCH/DELETE   /young-people
GET/POST/PATCH/DELETE   /vehicles
GET/POST/PATCH/DELETE   /tasks
GET/POST/PATCH/DELETE   /forms
GET/POST/PATCH/DELETE   /daily-logs
GET                     /announcements
```

### AI
```
POST   /ai/ask
```

### Uploads
```
POST   /uploads/sessions
POST   /uploads/:fileId/complete
GET    /uploads/:fileId/download-url
```

### Audit
```
GET    /audit/events
GET    /audit/security-alerts
```

### Tenants
```
GET    /tenants/:id/memberships
POST   /tenants/:id/memberships
GET    /tenants/:id/invites
POST   /tenants/:id/invites
GET    /tenants/:id/invite-links
POST   /tenants/:id/invite-links
```

### Public
```
POST   /public/book-demo
POST   /public/join-waitlist
POST   /public/contact-us
```

</details>

---

## Configuration Files

| File                 | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `next.config.ts`     | Remote image domains (flagcdn, unsplash)   |
| `tsconfig.json`      | TypeScript strict mode, `@/*` path alias   |
| `components.json`    | shadcn/ui config (New York style, neutral) |
| `postcss.config.mjs` | Tailwind CSS PostCSS plugin                |
| `eslint.config.mjs`  | Next.js core web vitals + TypeScript       |
| `vitest.config.ts`   | Test runner configuration                  |

---

## License

Proprietary - Zikel Solutions. All rights reserved.
