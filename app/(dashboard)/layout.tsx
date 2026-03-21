"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PageLoading } from "@/components/shared/page-loading"
import { Toast } from "@/components/shared/toast"
import { MfaBanner } from "@/components/mfa/mfa-banner"
import { MfaModal } from "@/components/mfa/mfa-modal"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { isLoading, isAuthenticated } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoading fullscreen message="Loading Zikel dashboard..." />
  }

  // Don't render dashboard if not authenticated (redirect will happen via context)
  if (!isAuthenticated) {
    return <PageLoading fullscreen message="Redirecting to Zikel sign in..." />
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
          <MfaBanner />
          {children}
        </main>
      </div>

      {/* Global MFA modal — triggered by API 403 or banner CTA */}
      <MfaModal />

      {/* Global toast notifications */}
      <Toast />
    </div>
  )
}
