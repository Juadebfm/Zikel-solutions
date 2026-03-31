"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PageLoading } from "@/components/shared/page-loading"
import { Toast } from "@/components/shared/toast"
import { MfaModal } from "@/components/mfa/mfa-modal"
import { useAuth } from "@/contexts/auth-context"
import { queryKeys } from "@/lib/query-keys"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { isLoading, isAuthenticated, hasPendingAcknowledgements, pendingAcknowledgementItems } = useAuth()
  const hasPrimedCache = useRef(false)
  const isAcknowledgementsRoute = pathname.startsWith("/acknowledgements")
  const useAcknowledgementsGateLayout =
    isAcknowledgementsRoute && hasPendingAcknowledgements

  // Prime the React Query cache so the acknowledgements page's
  // useAllSummaryTasksToApprove() finds data already in the cache.
  useEffect(() => {
    if (
      !hasPrimedCache.current &&
      pendingAcknowledgementItems &&
      pendingAcknowledgementItems.length > 0
    ) {
      hasPrimedCache.current = true
      queryClient.setQueryData(
        queryKeys.summary.tasksToApproveAll("all"),
        pendingAcknowledgementItems
      )
    }
  }, [pendingAcknowledgementItems, queryClient])

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoading fullscreen message="Loading Zikel dashboard..." />
  }

  // Don't render dashboard if not authenticated (redirect will happen via context)
  if (!isAuthenticated) {
    return <PageLoading fullscreen message="Redirecting to Zikel sign in..." />
  }

  if (useAcknowledgementsGateLayout) {
    return (
      <div className="min-h-screen bg-background">
        <main className="min-h-screen p-4 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>

        {/* Global MFA modal gate */}
        <MfaModal />

        {/* Global toast notifications */}
        <Toast />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Global MFA modal gate */}
      <MfaModal />

      {/* Global toast notifications */}
      <Toast />
    </div>
  )
}
