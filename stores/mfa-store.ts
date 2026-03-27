import { create } from "zustand"
import { useAuthSessionStore } from "@/stores/auth-session-store"

type MfaAuthState =
  | "authenticated_mfa_verified"
  | "authenticated_mfa_pending"
  | "unauthenticated"

interface PendingMfaWrite {
  resolve: (retryResult: { success: boolean }) => void
}

interface OpenMfaModalOptions {
  pendingWrite?: PendingMfaWrite | null
  forceGate?: boolean
}

interface MfaState {
  mfaModalOpen: boolean
  mfaGateActive: boolean
  pendingWrite: PendingMfaWrite | null
  openMfaModal: (options?: OpenMfaModalOptions) => void
  closeMfaModal: () => void
  activateMfaGate: () => void
  deactivateMfaGate: () => void
}

export const useMfaStore = create<MfaState>()((set) => ({
  mfaModalOpen: false,
  mfaGateActive: false,
  pendingWrite: null,

  openMfaModal: (options = {}) =>
    set((state) => ({
      mfaModalOpen: true,
      mfaGateActive: state.mfaGateActive || Boolean(options.forceGate),
      pendingWrite: options.pendingWrite ?? state.pendingWrite,
    })),

  closeMfaModal: () =>
    set((state) => {
      if (state.mfaGateActive) {
        return state
      }

      // Reject pending write if modal closed without completing MFA
      state.pendingWrite?.resolve({ success: false })
      return { mfaModalOpen: false, pendingWrite: null }
    }),

  activateMfaGate: () => set({ mfaGateActive: true, mfaModalOpen: true }),

  deactivateMfaGate: () =>
    set({ mfaGateActive: false, mfaModalOpen: false, pendingWrite: null }),
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
