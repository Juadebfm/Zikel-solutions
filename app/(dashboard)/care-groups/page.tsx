"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Plus, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AiChatDialog } from "@/components/shared/ai-chat-dialog"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { getApiErrorMessage } from "@/lib/api/error"
import { useCareGroupList } from "@/hooks/api/use-care-groups"
import { CreateCareGroupDialog } from "@/components/care-groups/create-care-group-dialog"
import type { AskAiPageContext } from "@/services/ai.service"

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function compactText(value: string | null | undefined): string {
  const normalized = value?.trim()
  return normalized ? normalized : "-"
}

export default function CareGroupsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const careGroupsQuery = useCareGroupList({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    isActive: true,
  })

  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    if (careGroupsQuery.error) {
      showError(getApiErrorMessage(careGroupsQuery.error, "Unable to load care groups."))
    }
  }, [careGroupsQuery.error, showError])

  const items = useMemo(() => careGroupsQuery.data?.items ?? [], [careGroupsQuery.data?.items])
  const meta = careGroupsQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? 0
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  const aiContext = useMemo<AskAiPageContext | undefined>(() => {
    if (!careGroupsQuery.data) return undefined

    return {
      items: items.slice(0, 25).map((careGroup) => ({
        id: careGroup.id,
        title: careGroup.name,
        type: careGroup.type,
        extra: {
          phoneNumber: careGroup.phoneNumber ?? "-",
          email: careGroup.email ?? "-",
          homes: String(careGroup.homes?.length ?? 0),
        },
      })),
      filters: {
        search: debouncedSearch || "all",
      },
      meta: meta
        ? {
            total: meta.total,
            page: meta.page,
            pageSize: meta.pageSize,
            totalPages: meta.totalPages,
          }
        : undefined,
    }
  }, [careGroupsQuery.data, debouncedSearch, items, meta])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Care Groups</h1>
          <p className="text-gray-500 mt-1">Manage care groups and their assigned homes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Care Group
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search care groups..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="rounded-md border relative overflow-x-auto">
              {careGroupsQuery.isFetching && !careGroupsQuery.isLoading && items.length > 0 ? (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : null}

              <Table className="min-w-[1900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Care Group Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Fax</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Address Line 1</TableHead>
                    <TableHead>Address Line 2</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country / Region</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Restriction</TableHead>
                    <TableHead>Twilio SID</TableHead>
                    <TableHead>Twilio Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Homes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {careGroupsQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={22} className="h-40 text-center text-muted-foreground">
                        No care groups found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((careGroup) => (
                      <TableRow key={careGroup.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Link
                            href={`/care-groups/${careGroup.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {careGroup.name}
                          </Link>
                        </TableCell>
                        <TableCell className="capitalize">{careGroup.type}</TableCell>
                        <TableCell>{compactText(careGroup.manager)}</TableCell>
                        <TableCell>{compactText(careGroup.contact)}</TableCell>
                        <TableCell>{compactText(careGroup.phoneNumber)}</TableCell>
                        <TableCell>{compactText(careGroup.email)}</TableCell>
                        <TableCell>{compactText(careGroup.faxNumber)}</TableCell>
                        <TableCell>
                          {careGroup.website ? (
                            <a
                              href={careGroup.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              {careGroup.website}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{compactText(careGroup.addressLine1)}</TableCell>
                        <TableCell>{compactText(careGroup.addressLine2)}</TableCell>
                        <TableCell>{compactText(careGroup.city)}</TableCell>
                        <TableCell>{compactText(careGroup.countryRegion)}</TableCell>
                        <TableCell>{compactText(careGroup.postcode)}</TableCell>
                        <TableCell className="max-w-[260px]">
                          <p className="truncate">{compactText(careGroup.description)}</p>
                        </TableCell>
                        <TableCell>{careGroup.defaultUserIpRestriction ? "Enabled" : "Disabled"}</TableCell>
                        <TableCell>{compactText(careGroup.twilioSid)}</TableCell>
                        <TableCell>{compactText(careGroup.twilioPhoneNumber)}</TableCell>
                        <TableCell>{careGroup.isActive ? "Active" : "Inactive"}</TableCell>
                        <TableCell>{careGroup.homes?.length ?? 0}</TableCell>
                        <TableCell>{formatDate(careGroup.createdAt)}</TableCell>
                        <TableCell>{formatDate(careGroup.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/care-groups/${careGroup.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}-{rangeEnd} of {totalItems}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    {[10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1 || careGroupsQuery.isLoading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <span className="sr-only">Previous page</span>
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>

                  <span className="px-2 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages || careGroupsQuery.isLoading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <span className="sr-only">Next page</span>
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AiChatDialog
        open={isAiOpen}
        onOpenChange={setIsAiOpen}
        page="care_groups"
        context={aiContext}
        description="Ask about care group coverage, contact details, and assignments."
      />

      <CreateCareGroupDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
