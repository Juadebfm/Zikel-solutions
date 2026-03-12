# Backend High-Level Plan (Neon + Fly.io)

Status update (March 12, 2026):
- Frontend runtime mock modules have been removed.
- Frontend data access now uses backend APIs via React Query hooks and shared API client.

## Purpose
- [ ] Build a production-ready backend from the current frontend domains and flows.
- [ ] Use Neon (Postgres) for data storage.
- [ ] Deploy the backend on Fly.io with secure, scalable defaults.

## Scope Derived from Frontend
- [ ] Auth and session flows (login, register, OTP verification, logout, current user).
- [ ] Role and permission model (staff, manager, admin; server-side RBAC enforcement).
- [ ] Core modules: care-groups, homes, employees, young-people, vehicles, tasks, announcements, dashboard.
- [ ] Audit and activity tracking for sensitive operations.
- [x] Replace mock data/services with API-driven data access.

## Target Architecture
- [ ] Node.js + TypeScript backend service.
- [ ] Fastify (or equivalent), Zod request/response validation, JWT auth.
- [ ] Prisma ORM + PostgreSQL on Neon.
- [ ] Stateless API design for horizontal scaling on Fly.io.
- [ ] OpenAPI-first contracts shared with frontend.

## Phased Delivery Plan

### Phase 0: Contract and Planning
- [ ] Freeze endpoint contracts from existing frontend types and route usage.
- [ ] Publish API module boundaries and ownership.
- [ ] Define non-functional requirements: latency, availability, security baseline.
- [ ] Produce OpenAPI draft for auth + core resources.

### Phase 1: Backend Foundation
- [ ] Bootstrap backend project, linting, formatting, test framework.
- [ ] Add standardized error handling and response envelope.
- [ ] Add /health and /ready endpoints.
- [ ] Add structured logging with request IDs.
- [ ] Add env config schema validation.

### Phase 2: Data Model and Neon Setup
- [ ] Design normalized schema for all frontend domains.
- [ ] Add migration pipeline and seed scripts from sanitized source data exports.
- [ ] Create indexes for list filters/sorts used by UI tables.
- [ ] Configure Neon environments: dev, staging, prod.
- [ ] Configure pooled runtime URL and direct migration URL separation.

### Phase 3: Auth and Authorization
- [ ] Implement login/register/verify-otp/resend-otp/logout/me endpoints.
- [ ] Implement secure password hashing and token lifecycle.
- [ ] Add server-side RBAC middleware and permission checks.
- [ ] Add auth/audit events for login and permission-sensitive actions.

### Phase 4: Core Feature APIs
- [ ] Implement CRUD/list endpoints with pagination, filtering, sorting.
- [ ] Implement dashboard aggregation endpoints.
- [ ] Implement task explorer search endpoints.
- [ ] Implement announcements list/detail endpoints.
- [ ] Implement audit read endpoints.

### Phase 5: Fly.io Deployment
- [ ] Add Dockerfile and fly.toml.
- [ ] Configure Fly secrets and runtime envs.
- [ ] Add release command for migrations.
- [ ] Configure health checks, autoscaling, and rollback path.
- [ ] Deploy staging, run smoke tests, then promote to production.

### Phase 6: Frontend Integration and Cutover
- [x] Replace mock auth service with real backend auth.
- [x] Replace mock list/data modules with React Query API hooks.
- [ ] Add feature flags for controlled rollout.
- [x] Remove local mock persistence once endpoints are stable.
- [ ] Run end-to-end acceptance checks and regression tests.

## Security Baseline Checklist (Required)
- [ ] Threat model and data classification (PII/sensitive records/audit).
- [ ] HTTPS-only and modern TLS in all environments.
- [ ] Strict CORS allowlist (no wildcard in production).
- [ ] Secure HTTP headers baseline.
- [ ] Request schema validation for every endpoint.
- [ ] Output encoding and input sanitization where applicable.
- [ ] Server-side authorization for every protected route.
- [ ] Password hashing with strong parameters.
- [ ] Access token expiry + refresh token rotation/revocation.
- [ ] Endpoint and auth rate limiting.
- [ ] Brute-force protection and lockout/backoff policy.
- [ ] SQL injection prevention (parameterized queries only).
- [ ] Payload size limits and parser hardening.
- [ ] Secrets in Fly secrets only; no secrets in repository.
- [ ] Secret/key rotation policy.
- [ ] Audit logs for auth, permission changes, destructive actions.
- [ ] Secure error handling (no sensitive internals in responses).
- [ ] Dependency scanning and patching policy.
- [ ] SAST in CI and protected branches.
- [ ] Backup and tested restore runbook.

## Scalability Checklist (Required)
- [ ] Stateless services for horizontal scaling.
- [ ] Correct connection pooling strategy for Neon.
- [ ] DB connection cap per instance.
- [ ] Pagination on all list endpoints.
- [ ] Idempotency for retried writes.
- [ ] Queue/background jobs for heavy workloads (exports, emails).
- [ ] Caching strategy (what, where, invalidation rules).
- [ ] Timeout/retry/circuit-breaker policy for external dependencies.
- [ ] Avoid synchronous heavy work in request path.
- [ ] Autoscaling thresholds and min/max machine policy on Fly.
- [ ] Load testing and capacity targets before production cutover.
- [ ] Environment isolation across dev/staging/prod.

## Performance and Optimization Checklist (Required)
- [ ] Query-driven index design from real frontend filters.
- [ ] Composite indexes for common where+sort patterns.
- [ ] EXPLAIN ANALYZE review for hot queries.
- [ ] Eliminate N+1 query patterns.
- [ ] Return only required fields in responses.
- [ ] Compression for suitable payloads.
- [ ] Cache headers/ETags for read-heavy resources.
- [ ] Async generation for long-running reports/exports.
- [ ] Endpoint SLOs with p95/p99 targets.
- [ ] Continuous slow-query monitoring.
- [ ] Graceful degradation for non-critical features.
- [ ] Startup and memory profile tuning for Fly Machines.

## Reliability and Operations Checklist
- [ ] Health/readiness probes wired to orchestration.
- [ ] Structured logs with correlation IDs.
- [ ] Metrics and traces (OpenTelemetry recommended).
- [ ] SLOs and alerting for latency/error/availability.
- [ ] Centralized error tracking.
- [ ] Backward-compatible migration strategy.
- [ ] Rollback playbook tested in staging.
- [ ] DR objectives (RPO/RTO) defined and exercised.

## Neon-Specific Checklist
- [ ] Runtime traffic uses pooled Neon connection URL.
- [ ] Migrations use direct Neon connection URL.
- [ ] Branch strategy for preview/test environments.
- [ ] Automated migration deploy in CI/CD release step.
- [ ] Data retention/backups and restore verification.
- [ ] Region alignment with Fly app for latency reduction.

## Fly.io-Specific Checklist
- [ ] fly.toml with region, services, health checks, concurrency.
- [ ] Secrets managed only with Fly secrets.
- [ ] Release command runs migrations before app traffic.
- [ ] Rolling deployment with rollback command documented.
- [ ] Autoscaling policy and baseline machine counts defined.
- [ ] Observability sink configured for logs/metrics/traces.

## Definition of Done
- [x] All critical frontend paths use backend APIs (no mock fallback in production).
- [ ] Security checklist complete and verified.
- [ ] Load test passes agreed throughput/latency targets.
- [ ] Staging and production deployment runbooks validated.
- [ ] Monitoring and alerts operational before go-live.
