import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { uploadsService } from "@/services/uploads.service"
import { useAuthSessionStore } from "@/stores/auth-session-store"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

describe("uploads service integration", () => {
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

  it("creates and completes signature upload sessions", async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(201, {
          success: true,
          data: {
            file: {
              id: "cmnaqqdbe001ihnplop7zz918",
              originalName: "ack-signature.png",
              contentType: "image/png",
              sizeBytes: 16480,
              purpose: "signature",
              status: "pending",
              uploadedAt: null,
              publicUrl: null,
              createdAt: "2026-03-28T19:46:05.749Z",
              updatedAt: "2026-03-28T19:46:05.749Z",
              checksumSha256: null,
            },
            upload: {
              method: "PUT",
              url: "https://example-r2-upload-url.test/signature",
              expiresAt: "2026-03-28T20:01:06.035Z",
              headers: {
                "Content-Type": "image/png",
              },
            },
          },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: {
            id: "cmnaqqdbe001ihnplop7zz918",
            originalName: "ack-signature.png",
            contentType: "image/png",
            sizeBytes: 16480,
            purpose: "signature",
            status: "uploaded",
            uploadedAt: "2026-03-28T19:46:10.000Z",
            publicUrl: null,
          },
        })
      )

    vi.stubGlobal("fetch", fetchMock)

    const session = await uploadsService.createSession({
      fileName: "ack-signature.png",
      contentType: "image/png",
      sizeBytes: 16480,
      purpose: "signature",
    })

    expect(session.fileId).toBe("cmnaqqdbe001ihnplop7zz918")
    expect(session.upload.url).toBe("https://example-r2-upload-url.test/signature")
    expect(session.upload.method).toBe("PUT")
    expect(session.upload.headers).toEqual({ "Content-Type": "image/png" })

    const completed = await uploadsService.completeUpload(session.fileId, 16480)
    expect(completed.file.id).toBe("cmnaqqdbe001ihnplop7zz918")
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("uploads blobs to signed url via PUT", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await uploadsService.uploadToSignedUrl({
      url: "https://example-r2-upload-url.test/signature",
      method: "PUT",
      contentType: "image/png",
      blob: new Blob(["test"], { type: "image/png" }),
      headers: { "Content-Type": "image/png" },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://example-r2-upload-url.test/signature")
    expect(options.method).toBe("PUT")
    expect((options.headers as Record<string, string>)["Content-Type"]).toBe("image/png")
  })
})
