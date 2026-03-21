import { create } from "zustand"
import { useAuthSessionStore } from "@/stores/auth-session-store"

type MfaAuthState =
  | "authenticated_mfa_verified"
  | "authenticated_mfa_pending"
  | "unauthenticated"

interface PendingMfaWrite {
  resolve: (retryResult: { success: boolean }) => void
}

interface MfaState {
  mfaModalOpen: boolean
  pendingWrite: PendingMfaWrite | null
  openMfaModal: (pendingWrite?: PendingMfaWrite | null) => void
  closeMfaModal: () => void
  dismissBanner: () => void
  bannerDismissed: boolean
}

export const useMfaStore = create<MfaState>()((set) => ({
  mfaModalOpen: false,
  pendingWrite: null,
  bannerDismissed: false,

  openMfaModal: (pendingWrite = null) =>
    set({ mfaModalOpen: true, pendingWrite }),

  closeMfaModal: () =>
    set((state) => {
      // Reject pending write if modal closed without completing MFA
      state.pendingWrite?.resolve({ success: false })
      return { mfaModalOpen: false, pendingWrite: null }
    }),

  dismissBanner: () => set({ bannerDismissed: true }),
}))

/**
 * Derives the current MFA auth state from the session store.
 * Source of truth is the session's mfaRequired/mfaVerified flags.
 */
export function getMfaAuthState(): MfaAuthState {
  const { session, user } = useAuthSessionStore.getState()

  if (!user || !session) {
    return "unauthenticated"
  }

  if (session.mfaRequired && !session.mfaVerified) {
    return "authenticated_mfa_pending"
  }

  return "authenticated_mfa_verified"
}

/**
 * React hook version of getMfaAuthState for use in components.
 */
export function useMfaAuthState(): MfaAuthState {
  const user = useAuthSessionStore((s) => s.user)
  const session = useAuthSessionStore((s) => s.session)

  if (!user || !session) {
    return "unauthenticated"
  }

  if (session.mfaRequired && !session.mfaVerified) {
    return "authenticated_mfa_pending"
  }

  return "authenticated_mfa_verified"
}
