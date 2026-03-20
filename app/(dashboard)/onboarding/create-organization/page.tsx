"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateOrganizationPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/my-summary")
  }, [router])

  return (
    <div className="mx-auto max-w-xl py-16 text-center space-y-3">
      <div className="flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
      <p className="text-sm text-gray-700 font-medium">Organization setup is now completed during registration.</p>
      <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
    </div>
  )
}
