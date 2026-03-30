"use client"

import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Copy,
  Archive,
  Globe,
} from "lucide-react"

import { FormListItem } from "@/services/forms.service"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface FormListTableProps {
  items: FormListItem[]
  loading: boolean
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onEdit: (formId: string) => void
  onClone: (formId: string) => void
  onArchive: (formId: string) => void
  onPublish: (formId: string) => void
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  released: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  archived: "bg-amber-100 text-amber-700 hover:bg-amber-100",
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  released: "Published",
  archived: "Archived",
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-"
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return "-"
  return dateFormatter.format(d)
}

export function FormListTable({
  items,
  loading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onEdit,
  onClone,
  onArchive,
  onPublish,
}: FormListTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No forms found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.key}</div>
                </TableCell>
                <TableCell>{item.formGroup || item.group || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(statusStyles[item.status])}
                  >
                    {statusLabels[item.status] ?? item.status}
                  </Badge>
                </TableCell>
                <TableCell>v{item.builder?.version ?? 1}</TableCell>
                <TableCell>{item.formTypes?.join(", ") || "-"}</TableCell>
                <TableCell>{formatDate(item.updatedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onClone(item.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Clone
                      </DropdownMenuItem>
                      {item.status === "draft" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onPublish(item.id)}>
                            <Globe className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        </>
                      )}
                      {item.status === "released" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onArchive(item.id)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
