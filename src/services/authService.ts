import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api.config';
import { StorageService } from './storage.service';
import {
  ApiResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponseData,
  UpdateProfilePayload,
} from '../types/auth.types';

export const AuthService = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginPayload): Promise<LoginResponseData> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponseData>>(
        API_CONFIG.ENDPOINTS.LOGIN,
        {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        }
      );

      const responseData = response.data;

      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Login failed. Invalid credentials.');
      }

      const { accessToken, refreshToken, user, expiresIn } = responseData.data;

      // Persist auth tokens and user data
      await StorageService.saveTokens({ accessToken, refreshToken, expiresIn });
      if (user) {
        await StorageService.saveUser(user);
      }

      return responseData.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Unable to connect to Yenmin FMS server. Please verify network.';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  /**
   * Fetch live profile of authenticated user
   */
  async getProfile(): Promise<AuthUser> {
    try {
      const response = await apiClient.get<ApiResponse<AuthUser>>(
        API_CONFIG.ENDPOINTS.PROFILE
      );

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to fetch user profile.');
      }

      await StorageService.saveUser(responseData.data);
      return responseData.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user profile.';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  /**
   * Update profile details (name, phone, department)
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    try {
      const response = await apiClient.patch<ApiResponse<AuthUser>>(
        API_CONFIG.ENDPOINTS.PROFILE,
        payload
      );

      const responseData = response.data;
      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to update profile.');
      }

      await StorageService.saveUser(responseData.data);
      return responseData.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile.';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  /**
   * Change user password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        API_CONFIG.ENDPOINTS.CHANGE_PASSWORD,
        payload
      );

      const responseData = response.data;
      if (!responseData.status) {
        throw new Error(responseData.message || 'Failed to change password.');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to change password.';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  /**
   * Logout user and invalidate session
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await StorageService.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, { refreshToken }).catch(() => {
          // Ignore server logout errors on client teardown
        });
      }
    } finally {
      await StorageService.clearAuthData();
    }
  },

  /**
   * Request 6-digit password reset OTP
   */
  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
        { email: email.trim().toLowerCase() }
      );
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to request password reset code.');
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unable to request password recovery. Please check your registered email address.';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },

  /**
   * Verify OTP and reset password
   */
  async resetPassword(payload: { email?: string; otp: string; newPassword: string }): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        API_CONFIG.ENDPOINTS.RESET_PASSWORD,
        payload
      );
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to reset password.');
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password. Please check your OTP code.';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },
};

