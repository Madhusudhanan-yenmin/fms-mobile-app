import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AuthTokens,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  UpdateProfilePayload,
} from '../../types/auth.types';
import { AuthService } from '../../services/authService';
import { StorageService } from '../../services/storage.service';

/**
 * 1. Check existing saved auth session on app cold start
 */
export const checkAuthSessionThunk = createAsyncThunk<{ tokens: AuthTokens; user: AuthUser } | null>(
  'auth/checkAuthSession',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await StorageService.getTokens();
      if (!tokens?.accessToken) {
        return null;
      }

      // Load cached user profile first
      const cachedUser = await StorageService.getUser();

      try {
        // Try refreshing profile from live backend API
        const liveUser = await AuthService.getProfile();
        return { tokens, user: liveUser };
      } catch (e) {
        // Fallback to cached profile if offline or network hiccup
        if (cachedUser) {
          return { tokens, user: cachedUser };
        }
        return null;
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Session verification failed');
    }
  }
);

/**
 * 2. Login Thunk (POST /api/v1/auth/login)
 */
export const loginThunk = createAsyncThunk(
  'auth/loginThunk',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const data = await AuthService.login(credentials);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

/**
 * 3. Fetch User Profile Thunk (GET /api/v1/auth/profile)
 */
export const getProfileThunk = createAsyncThunk(
  'auth/getProfileThunk',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthService.getProfile();
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

/**
 * 4. Update Profile Thunk (PATCH /api/v1/auth/profile)
 */
export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfileThunk',
  async (payload: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const updatedUser = await AuthService.updateProfile(payload);
      return updatedUser;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

/**
 * 5. Change Password Thunk (POST /api/v1/auth/change-password)
 */
export const changePasswordThunk = createAsyncThunk(
  'auth/changePasswordThunk',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      await AuthService.changePassword(payload);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to change password');
    }
  }
);

/**
 * 6. Logout Thunk (POST /api/v1/auth/logout & clear storage)
 */
export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async () => {
    await AuthService.logout();
    return true;
  }
);

/**
 * 7. Forgot Password Thunk (POST /api/v1/auth/forgot-password)
 */
export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPasswordThunk',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.forgotPassword(email);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send recovery code');
    }
  }
);

/**
 * 8. Reset Password Thunk (POST /api/v1/auth/reset-password)
 */
export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPasswordThunk',
  async (
    payload: { email?: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await AuthService.resetPassword(payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to reset password');
    }
  }
);

// Backward-compatibility aliases matching common naming
export const checkAuthSession = checkAuthSessionThunk;
export const loginUser = loginThunk;
export const fetchUserProfile = getProfileThunk;
export const updateUserProfile = updateProfileThunk;
export const changeUserPassword = changePasswordThunk;
export const logoutUser = logoutThunk;
export const forgotPassword = forgotPasswordThunk;
export const resetPassword = resetPasswordThunk;

