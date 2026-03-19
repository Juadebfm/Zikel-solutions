"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PageLoading } from "@/components/shared/page-loading"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, session } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        const hasTenantContext = Boolean(
          (session?.memberships.length ?? 0) > 0 || session?.activeTenantId
        )
        router.push(hasTenantContext ? "/my-summary" : "/onboarding/create-organization")
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, router, session])

  return (
    <PageLoading fullscreen message="Preparing your Zikel workspace..." />
  )
}
