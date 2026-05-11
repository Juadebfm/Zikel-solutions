"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Receipt } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useInvoices } from "@/hooks/api/use-billing"
import { formatMinorAmount, type InvoiceStatus } from "@/services/billing.service"

const PAGE_SIZE = 10

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function statusBadge(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Paid</Badge>
    case "open":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Open</Badge>
    case "void":
      return <Badge variant="outline">Void</Badge>
    case "uncollectible":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Uncollectible</Badge>
    case "draft":
      return <Badge variant="outline">Draft</Badge>
  }
}

export function InvoiceTable() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useInvoices({ page, pageSize: PAGE_SIZE })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  const invoices = data?.data ?? []
  const total = data?.meta?.total ?? invoices.length
  const totalPages = data?.meta?.totalPages ?? 1
  const hasInvoices = invoices.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Invoices
        </CardTitle>
        <CardDescription>
          {total > 0
            ? `${total} invoice${total === 1 ? "" : "s"}`
            : "Invoices will appear here once you have an active subscription."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasInvoices ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No invoices yet.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMinorAmount(
                        invoice.status === "paid" ? invoice.amountPaidMinor : invoice.amountDueMinor,
                        invoice.currency,
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invoice.hostedInvoiceUrl ? (
                          <Button asChild variant="ghost" size="sm">
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              View
                            </a>
                          </Button>
                        ) : null}
                        {invoice.pdfUrl ? (
                          <Button asChild variant="ghost" size="sm">
                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" aria-hidden="true" />
                              PDF
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
