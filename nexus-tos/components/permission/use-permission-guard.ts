"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { RolePermissions } from "@/types"

export function usePermissionGuard(permission: keyof RolePermissions) {
  const { hasPermission } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const allowed = hasPermission(permission)

  const guard = useCallback(
    (action: () => void) => {
      if (allowed) {
        action()
      } else {
        setShowModal(true)
      }
    },
    [allowed]
  )

  return { guard, allowed, showModal, setShowModal }
}
