import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  apiRequest,
  clearPendingMfaRequest,
  retryPendingMfaRequest,
} from "@/lib/api/client"
import { useAuthSessionStore } from "@/stores/auth-session-store"
import { useMfaStore } from "@/stores/mfa-store"
import type { AuthSessionContext } from "@/types"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

function seedAuthenticatedSession(overrides?: Partial<AuthSessionContext>) {
  useAuthSessionStore.setState({
    user: null,
    accessToken: "access-old",
    refreshToken: "refresh-old",
    permissions: null,
    hasHydrated: true,
    session: {
      activeTenantId: "tenant-1",
      activeTenantRole: "tenant_admin",
      memberships: [
        {
          id: "membership-1",
          tenantId: "tenant-1",
          tenantRole: "tenant_admin",
          isActive: true,
          status: "active",
          tenantName: "Sunrise Care",
          tenantSlug: "sunrise-care",
        },
      ],
      mfaRequired: false,
      mfaVerified: false,
      ...overrides,
    },
  })
}

describe("api client integration: refresh and mfa", () => {
  beforeEach(() => {
    clearPendingMfaRequest()
    useAuthSessionStore.getState().clearSession()
    useMfaStore.setState({
      mfaModalOpen: false,
      mfaGateActive: false,
      pendingWrite: null,
    })
  })

  afterEach(() => {
    clearPendingMfaRequest()
    useAuthSessionStore.getState().clearSession()
    useMfaStore.setState({
      mfaModalOpen: false,
      mfaGateActive: false,
      pendingWrite: null,
    })
    vi.unstubAllGlobals()
  })

  it("rotates refresh tokens and retries the original request once", async () => {
    seedAuthenticatedSession()

    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(401, {
          success: false,
          error: { code: "ACCESS_TOKEN_INVALID", message: "Access token expired." },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: {
            tokens: {
              accessToken: "access-new",
              refreshToken: "refresh-new",
            },
            session: {
              activeTenantId: "tenant-2",
              activeTenantRole: "tenant_admin",
              memberships: [
                {
                  id: "membership-2",
                  tenantId: "tenant-2",
                  tenantRole: "tenant_admin",
                  isActive: true,
                  status: "active",
                  tenantName: "Riverside",
                  tenantSlug: "riverside",
                },
              ],
              mfaRequired: true,
              mfaVerified: false,
            },
          },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: { ok: true },
        })
      )

    vi.stubGlobal("fetch", fetchMock)

    const result = await apiRequest<{ ok: boolean }>({
      path: "/summary/stats",
      auth: true,
    })

    expect(result.data.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(3)

    const firstInit = fetchMock.mock.calls[0][1] as RequestInit
    const thirdInit = fetchMock.mock.calls[2][1] as RequestInit
    expect((firstInit.headers as Record<string, string>).Authorization).toBe("Bearer access-old")
    expect((thirdInit.headers as Record<string, string>).Authorization).toBe("Bearer access-new")

    const state = useAuthSessionStore.getState()
    expect(state.accessToken).toBe("access-new")
    expect(state.refreshToken).toBe("refresh-new")
    expect(state.session?.activeTenantId).toBe("tenant-2")
    expect(state.session?.memberships[0]?.tenantSlug).toBe("riverside")
    expect(state.session?.memberships[0]?.status).toBe("active")
  })

  it("clears session when refresh token is invalid", async () => {
    seedAuthenticatedSession()

    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(401, {
          success: false,
          error: { code: "ACCESS_TOKEN_INVALID", message: "Access token expired." },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(401, {
          success: false,
          error: { code: "REFRESH_TOKEN_INVALID", message: "Refresh token invalid." },
        })
      )

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiRequest({
        path: "/summary/stats",
        auth: true,
      })
    ).rejects.toMatchObject({
      code: "ACCESS_TOKEN_INVALID",
      status: 401,
    })

    const state = useAuthSessionStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.session).toBeNull()
  })

  it("stores MFA-required request and retries it once after verification", async () => {
    seedAuthenticatedSession({
      mfaRequired: false,
      mfaVerified: true,
    })

    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(403, {
          success: false,
          error: { code: "MFA_REQUIRED", message: "MFA required." },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: { ok: true },
        })
      )

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      apiRequest({
        path: "/audit",
        auth: true,
      })
    ).rejects.toMatchObject({
      code: "MFA_REQUIRED",
      status: 403,
    })

    const stateAfterFailure = useAuthSessionStore.getState()
    expect(stateAfterFailure.session?.mfaRequired).toBe(true)
    expect(stateAfterFailure.session?.mfaVerified).toBe(false)

    const retried = await retryPendingMfaRequest()
    expect(retried).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("blocks write requests until MFA verification completes", async () => {
    seedAuthenticatedSession({
      mfaRequired: true,
      mfaVerified: false,
    })

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: { ok: true },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const requestPromise = apiRequest<{ ok: boolean }>({
      path: "/audit",
      method: "POST",
      auth: true,
      body: { reason: "test" },
    })

    expect(useMfaStore.getState().mfaModalOpen).toBe(true)
    expect(useMfaStore.getState().mfaGateActive).toBe(true)

    useMfaStore.getState().pendingWrite?.resolve({ success: true })

    const result = await requestPromise
    expect(result.data.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects write requests when MFA gate is not completed", async () => {
    seedAuthenticatedSession({
      mfaRequired: true,
      mfaVerified: false,
    })

    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const requestPromise = apiRequest({
      path: "/audit",
      method: "POST",
      auth: true,
      body: { reason: "test" },
    })

    useMfaStore.getState().pendingWrite?.resolve({ success: false })

    await expect(requestPromise).rejects.toMatchObject({
      code: "MFA_REQUIRED",
      status: 403,
    })

    expect(fetchMock).toHaveBeenCalledTimes(0)
  })

  it("does not block MFA challenge endpoint while MFA is pending", async () => {
    seedAuthenticatedSession({
      mfaRequired: true,
      mfaVerified: false,
    })

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: { message: "Challenge sent." },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await apiRequest<{ message: string }>({
      path: "/auth/mfa/challenge",
      method: "POST",
      auth: true,
    })

    expect(result.data.message).toBe("Challenge sent.")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(useMfaStore.getState().mfaModalOpen).toBe(false)
  })
})
