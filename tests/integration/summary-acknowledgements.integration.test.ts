import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { summaryService } from "@/services/summary.service"
import { useAuthSessionStore } from "@/stores/auth-session-store"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

describe("summary service integration: acknowledgements", () => {
  beforeEach(() => {
    useAuthSessionStore.setState({
      user: null,
      accessToken: "token-123",
      session: null,
      permissions: null,
      hasHydrated: true,
    })
  })

  afterEach(() => {
    useAuthSessionStore.getState().clearSession()
    vi.unstubAllGlobals()
  })

  it("loads all pending approval pages for acknowledgements gate checks", async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: [
            {
              id: "task-1",
              title: "Location Risk Assessment",
              relation: "document",
              status: "pending",
              approvalStatus: "pending",
              priority: "high",
              assignee: "Kwadwo",
              dueDate: "2026-03-23T00:01:15.000Z",
              reviewedByCurrentUser: false,
              reviewedAt: null,
            },
            {
              id: "task-2",
              title: "Safeguarding Policy",
              relation: "document",
              status: "pending",
              approvalStatus: "pending",
              priority: "high",
              assignee: "Kwadwo",
              dueDate: "2026-03-23T00:01:15.000Z",
              reviewedByCurrentUser: false,
              reviewedAt: null,
            },
          ],
          meta: {
            total: 3,
            page: 1,
            pageSize: 2,
            totalPages: 2,
          },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: [
            {
              id: "task-3",
              title: "Care Plan",
              relation: "document",
              status: "pending",
              approvalStatus: "pending",
              priority: "high",
              assignee: "Kwadwo",
              dueDate: "2026-03-23T00:01:15.000Z",
              reviewedByCurrentUser: true,
              reviewedAt: "2026-03-26T09:00:00.000Z",
            },
          ],
          meta: {
            total: 3,
            page: 2,
            pageSize: 2,
            totalPages: 2,
          },
        })
      )

    vi.stubGlobal("fetch", fetchMock)

    const rows = await summaryService.getAllTasksToApprove(2)

    expect(rows).toHaveLength(3)
    expect(rows.map((row) => row.id)).toEqual(["task-1", "task-2", "task-3"])
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [firstUrl] = fetchMock.mock.calls[0] as [string, RequestInit]
    const [secondUrl] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(firstUrl).toContain("/summary/tasks-to-approve?page=1&pageSize=2")
    expect(secondUrl).toContain("/summary/tasks-to-approve?page=2&pageSize=2")
  })

  it("clamps page size to backend max when loading all pending approvals", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 100,
          totalPages: 1,
        },
      })
    )

    vi.stubGlobal("fetch", fetchMock)

    await summaryService.getAllTasksToApprove(800)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [firstUrl] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(firstUrl).toContain("/summary/tasks-to-approve?page=1&pageSize=100")
  })

  it("passes signatureFileId when processing batch approvals", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: {
          processed: 2,
          failed: [],
        },
      })
    )

    vi.stubGlobal("fetch", fetchMock)

    await summaryService.processBatch({
      taskIds: ["task-1", "task-2"],
      action: "approve",
      signatureFileId: "file-abc123",
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain("/summary/tasks-to-approve/process-batch")
    expect(options.method).toBe("POST")
    expect(options.body).toContain("\"signatureFileId\":\"file-abc123\"")
  })
})
