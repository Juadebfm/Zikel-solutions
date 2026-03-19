import { apiRequest } from "@/lib/api/client"
import { isApiClientError } from "@/lib/api/error"
import type {
  AuthSessionContext,
  Gender,
  RolePermissions,
  SignupFormData,
  TenantMembership,
  TenantRole,
  User,
} from "@/types"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthApiUser {
  id: string
  email: string
  role: "staff" | "manager" | "admin" | "super_admin"
  firstName: string
  middleName: string | null
  lastName: string
  gender: Gender
  country: string
  phoneNumber: string | null
  avatarUrl: string | null
  language: string
  timezone: string
  emailVerified: boolean
  acceptedTerms: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  user: AuthApiUser
  session?: AuthApiSession
  tokens: AuthTokens
}

export interface RegisterPayload {
  userId: string
  message: string
  otpDeliveryStatus: OtpDeliveryStatus
  resendAvailableAt: string
}

export interface ResendOtpPayload {
  message: string
  cooldownSeconds: number
  otpDeliveryStatus: OtpDeliveryStatus
  resendAvailableAt: string
}

export interface GenericMessagePayload {
  message: string
}

export type OtpDeliveryStatus = "sent" | "queued" | "failed"

export interface AuthApiMembership {
  id: string
  tenantId: string
  tenantRole: TenantRole
  isActive: boolean
  tenantName?: string | null
}

export interface AuthApiSession {
  activeTenantId: string | null
  activeTenantRole: TenantRole | null
  memberships: AuthApiMembership[]
  mfaRequired: boolean
  mfaVerified: boolean
}

export interface AccessTokenPayload {
  accessToken: string
  session?: AuthApiSession
}

interface AccessTokenEnvelope {
  accessToken?: string
  tokens?: {
    accessToken?: string
  }
  session?: AuthApiSession
}

export interface MeProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "staff" | "manager" | "admin"
  avatar: string | null
  homeId: string | null
  homeName: string | null
  phone: string | null
  jobTitle: string | null
  language: string
  timezone: string
  createdAt: string
  lastLoginAt: string | null
}

export interface MePreferences {
  language: string
  timezone: string
}

export interface ResetPasswordInput {
  email: string
  code: string
  newPassword: string
  confirmPassword: string
}

function mapAuthApiUserToAppUser(user: AuthApiUser): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.avatarUrl ?? undefined,
    phone: user.phoneNumber ?? undefined,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? undefined,
    language: user.language,
    timezone: user.timezone,
  }
}

function mapAuthApiSessionToAppSession(session?: AuthApiSession | null): AuthSessionContext {
  if (!session) {
    return {
      activeTenantId: null,
      activeTenantRole: null,
      memberships: [],
      mfaRequired: false,
      mfaVerified: false,
    }
  }

  return {
    activeTenantId: session.activeTenantId ?? null,
    activeTenantRole: session.activeTenantRole ?? null,
    memberships: session.memberships.map((membership): TenantMembership => ({
      id: membership.id,
      tenantId: membership.tenantId,
      tenantRole: membership.tenantRole,
      isActive: membership.isActive,
      tenantName: membership.tenantName ?? undefined,
    })),
    mfaRequired: session.mfaRequired,
    mfaVerified: session.mfaVerified,
  }
}

function mapMeProfileToAppUser(profile: MeProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    avatar: profile.avatar ?? undefined,
    homeId: profile.homeId ?? undefined,
    homeName: profile.homeName ?? undefined,
    phone: profile.phone ?? undefined,
    jobTitle: profile.jobTitle ?? undefined,
    language: profile.language,
    timezone: profile.timezone,
    createdAt: profile.createdAt,
    lastLoginAt: profile.lastLoginAt ?? undefined,
  }
}

function shouldRetryWithLegacyBody(error: unknown): boolean {
  if (!isApiClientError(error)) {
    return false
  }

  if (error.status !== 400 && error.status !== 422) {
    return false
  }

  const code = error.code.toUpperCase()
  return (
    code === "FST_ERR_VALIDATION" ||
    code === "VALIDATION_ERROR" ||
    code === "BAD_REQUEST" ||
    code === "REQUEST_FAILED" ||
    code.includes("VALIDATION")
  )
}

export const authService = {
  async register(data: SignupFormData): Promise<RegisterPayload> {
    const response = await apiRequest<RegisterPayload>({
      path: "/auth/register",
      method: "POST",
      body: {
        country: data.country,
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.surname,
        gender: data.gender,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password,
        confirmPassword: data.password,
        acceptTerms: true,
      },
    })

    return response.data
  },

  async checkEmailAvailability(email: string): Promise<boolean> {
    const response = await apiRequest<{ available: boolean }>({
      path: "/auth/check-email",
      query: { email },
    })

    return response.data.available
  },

  async login(email: string, password: string): Promise<LoginPayload> {
    const response = await apiRequest<LoginPayload>({
      path: "/auth/login",
      method: "POST",
      body: { email, password },
    })

    return response.data
  },

  async verifyOtp(email: string, code: string): Promise<LoginPayload> {
    try {
      const response = await apiRequest<LoginPayload>({
        path: "/auth/verify-otp",
        method: "POST",
        body: { email, code },
      })

      return response.data
    } catch (error) {
      if (!shouldRetryWithLegacyBody(error)) {
        throw error
      }

      const response = await apiRequest<LoginPayload>({
        path: "/auth/verify-otp",
        method: "POST",
        body: { email, otp: code },
      })

      return response.data
    }
  },

  async resendOtp(email: string): Promise<ResendOtpPayload> {
    try {
      const response = await apiRequest<ResendOtpPayload>({
        path: "/auth/resend-otp",
        method: "POST",
        body: { email, purpose: "email_verification" },
      })

      return response.data
    } catch (error) {
      if (!shouldRetryWithLegacyBody(error)) {
        throw error
      }

      const response = await apiRequest<ResendOtpPayload>({
        path: "/auth/resend-otp",
        method: "POST",
        body: { email },
      })

      return response.data
    }
  },

  async refresh(refreshToken: string): Promise<LoginPayload> {
    try {
      const response = await apiRequest<LoginPayload>({
        path: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      })

      return response.data
    } catch (error) {
      if (!shouldRetryWithLegacyBody(error)) {
        throw error
      }

      const response = await apiRequest<LoginPayload>({
        path: "/auth/refresh",
        method: "POST",
        body: { token: refreshToken },
      })

      return response.data
    }
  },

  async logout(refreshToken: string): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: "/auth/logout",
      method: "POST",
      auth: true,
      body: { refreshToken },
    })

    return response.data
  },

  async forgotPassword(email: string): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: "/auth/forgot-password",
      method: "POST",
      body: { email },
    })

    return response.data
  },

  async resetPassword(input: ResetPasswordInput): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: "/auth/reset-password",
      method: "POST",
      body: input,
    })

    return response.data
  },

  async challengeMfa(): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: "/auth/mfa/challenge",
      method: "POST",
      auth: true,
    })

    return response.data
  },

  async verifyMfa(code: string): Promise<AccessTokenPayload> {
    const response = await apiRequest<AccessTokenEnvelope>({
      path: "/auth/mfa/verify",
      method: "POST",
      auth: true,
      body: { code },
    })

    const accessToken = response.data.accessToken ?? response.data.tokens?.accessToken
    if (!accessToken) {
      throw new Error("Invalid MFA verify response from server.")
    }

    return {
      accessToken,
      session: response.data.session,
    }
  },

  async switchTenant(tenantId: string): Promise<AccessTokenPayload> {
    const response = await apiRequest<AccessTokenEnvelope>({
      path: "/auth/switch-tenant",
      method: "POST",
      auth: true,
      body: { tenantId },
    })

    const accessToken = response.data.accessToken ?? response.data.tokens?.accessToken
    if (!accessToken) {
      throw new Error("Invalid tenant switch response from server.")
    }

    return {
      accessToken,
      session: response.data.session,
    }
  },

  async getAuthMe(): Promise<AuthApiUser> {
    const response = await apiRequest<AuthApiUser>({
      path: "/auth/me",
      auth: true,
    })

    return response.data
  },

  async getMeProfile(): Promise<MeProfile> {
    const response = await apiRequest<MeProfile>({
      path: "/me",
      auth: true,
    })

    return response.data
  },

  async updateMeProfile(input: Partial<Pick<MeProfile, "firstName" | "lastName" | "phone" | "avatar">>): Promise<MeProfile> {
    const response = await apiRequest<MeProfile>({
      path: "/me",
      method: "PATCH",
      auth: true,
      body: input,
    })

    return response.data
  },

  async changePassword(input: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: "/me/change-password",
      method: "POST",
      auth: true,
      body: input,
    })

    return response.data
  },

  async getPermissions(): Promise<RolePermissions> {
    const response = await apiRequest<RolePermissions>({
      path: "/me/permissions",
      auth: true,
    })

    return response.data
  },

  async getPreferences(): Promise<MePreferences> {
    const response = await apiRequest<MePreferences>({
      path: "/me/preferences",
      auth: true,
    })

    return response.data
  },

  async updatePreferences(input: Partial<MePreferences>): Promise<MePreferences> {
    const response = await apiRequest<MePreferences>({
      path: "/me/preferences",
      method: "PATCH",
      auth: true,
      body: input,
    })

    return response.data
  },

  mapAuthApiUserToAppUser,
  mapAuthApiSessionToAppSession,
  mapMeProfileToAppUser,
}

export default authService
