import { apiRequest } from "@/lib/api/client"
import type { Gender, RolePermissions, SignupFormData, User } from "@/types"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthApiUser {
  id: string
  email: string
  role: "staff" | "manager" | "admin"
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
  tokens: AuthTokens
}

export interface RegisterPayload {
  userId: string
  message: string
}

export interface ResendOtpPayload {
  message: string
  cooldownSeconds: number
}

export interface GenericMessagePayload {
  message: string
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
    const response = await apiRequest<LoginPayload>({
      path: "/auth/verify-otp",
      method: "POST",
      body: { email, code },
    })

    return response.data
  },

  async resendOtp(email: string): Promise<ResendOtpPayload> {
    const response = await apiRequest<ResendOtpPayload>({
      path: "/auth/resend-otp",
      method: "POST",
      body: { email, purpose: "email_verification" },
    })

    return response.data
  },

  async refresh(refreshToken: string): Promise<LoginPayload> {
    const response = await apiRequest<LoginPayload>({
      path: "/auth/refresh",
      method: "POST",
      body: { refreshToken },
    })

    return response.data
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
  mapMeProfileToAppUser,
}

export default authService
