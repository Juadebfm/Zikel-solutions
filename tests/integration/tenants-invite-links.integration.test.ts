import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { tenantsService } from "@/services/tenants.service"
import { useAuthSessionStore } from "@/stores/auth-session-store"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

describe("tenants service integration: invite links", () => {
  beforeEach(() => {
    useAuthSessionStore.setState({
      user: null,
      accessToken: "token-123",
      refreshToken: "refresh-123",
      session: null,
      permissions: null,
      hasHydrated: true,
    })
  })

  afterEach(() => {
    useAuthSessionStore.getState().clearSession()
    vi.unstubAllGlobals()
  })

  it("lists invite links and normalizes response payload", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data: {
          inviteLinks: [
            {
              id: "link-1",
              tenantId: "tenant-1",
              tenantName: "Sunrise Care",
              code: "abc123",
              defaultRole: "staff",
              isActive: true,
              expiresAt: null,
              createdAt: "2026-03-19T09:00:00.000Z",
            },
          ],
        },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await tenantsService.listInviteLinks("tenant-1")

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: "link-1",
      tenantId: "tenant-1",
      tenantName: "Sunrise Care",
      code: "abc123",
      defaultRole: "staff",
      isActive: true,
    })
    expect(result.meta.total).toBe(1)
  })

  it("creates invite link using tenant endpoint and auth bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data: {
          message: "Invite link generated.",
          id: "link-2",
          tenantId: "tenant-1",
          tenantName: "Sunrise Care",
          code: "def456",
          defaultRole: "sub_admin",
          isActive: true,
          expiresAt: "2026-03-26T09:00:00.000Z",
          createdAt: "2026-03-19T09:00:00.000Z",
        },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await tenantsService.createInviteLink("tenant-1", {
      defaultRole: "sub_admin",
      expiresInHours: 168,
    })

    expect(result.message).toBe("Invite link generated.")
    expect(result.link?.code).toBe("def456")
    expect(result.link?.defaultRole).toBe("sub_admin")

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-123")
  })

  it("revokes invite link and returns resolved id", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data: {
          message: "Invite link revoked.",
          inviteLink: {
            id: "link-3",
            isActive: false,
          },
        },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await tenantsService.revokeInviteLink("tenant-1", "link-3")

    expect(result.message).toBe("Invite link revoked.")
    expect(result.inviteLinkId).toBe("link-3")
  })
})
