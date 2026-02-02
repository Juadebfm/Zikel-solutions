/**
 * Auth Service
 *
 * This service provides an abstraction layer for all authentication-related API calls.
 * Currently uses mock implementations, but can easily be swapped for real API calls.
 *
 * When backend is ready:
 * 1. Replace mock function imports with actual API calls
 * 2. Update the base URL in api config
 * 3. No changes needed to consuming components
 */

import type {
  AuthResponse,
  SignupFormData,
  OTPVerificationResponse,
  User,
} from "@/types"
import {
  authenticateUser,
  initiateSignup,
  verifyOTP as mockVerifyOTP,
  resendOTP as mockResendOTP,
  getUserById,
  getUserByEmail,
  checkEmailExists,
} from "@/lib/mock-auth"

export interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>
  signup(data: SignupFormData): Promise<AuthResponse>
  sendVerificationCode(email: string): Promise<{ success: boolean; message?: string }>
  verifyOTP(email: string, code: string): Promise<OTPVerificationResponse>
  resendOTP(email: string): Promise<{ success: boolean; message?: string }>
  getUser(userId: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  checkEmailExists(email: string): Promise<boolean>
}

/**
 * Auth service implementation
 * Uses mock functions for now, ready to swap with real API calls
 */
export const authService: AuthService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return authenticateUser(email, password)
  },

  /**
   * Start the signup process
   * Creates account and sends verification email
   */
  async signup(data: SignupFormData): Promise<AuthResponse> {
    return initiateSignup(data)
  },

  /**
   * Send initial verification code to email
   */
  async sendVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
    // This is called automatically during signup
    // For resending, use resendOTP
    return { success: true, message: "Verification code sent" }
  },

  /**
   * Verify OTP code
   */
  async verifyOTP(email: string, code: string): Promise<OTPVerificationResponse> {
    return mockVerifyOTP(email, code)
  },

  /**
   * Resend OTP code
   */
  async resendOTP(email: string): Promise<{ success: boolean; message?: string }> {
    return mockResendOTP(email)
  },

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    return getUserById(userId)
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return getUserByEmail(email)
  },

  /**
   * Check if email already exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    return checkEmailExists(email)
  },
}

export default authService
