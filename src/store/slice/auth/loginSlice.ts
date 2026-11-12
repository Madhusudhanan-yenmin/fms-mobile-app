import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthTokens, AuthUser, mapBackendRoleToAppRole } from '../../../types/auth.types';
import { AppRole } from '../../../constants/roles';
import {
  checkAuthSessionThunk,
  loginThunk,
  getProfileThunk,
  updateProfileThunk,
  logoutThunk,
} from '../../asyncThunks/auth';

export interface LoginState {
  data: any | null;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  activeRole: AppRole;
  isAuthenticated: boolean;
  isInitializing: boolean;
  loading: boolean;
  isLoading: boolean; // Convenience alias
  error: string | null;
}

const initialState: LoginState = {
  data: null,
  user: null,
  token: null,
  refreshToken: null,
  activeRole: 'technician',
  isAuthenticated: false,
  isInitializing: true,
  loading: false,
  isLoading: false,
  error: null,
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    restoreLoginDetail: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setActiveRole: (state, action: PayloadAction<AppRole>) => {
      state.activeRole = action.payload;
    },
    logoutAction: (state) => {
      state.data = null;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.activeRole = 'technician';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Session verification on cold start
    builder
      .addCase(checkAuthSessionThunk.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(checkAuthSessionThunk.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (action.payload) {
          state.token = action.payload.tokens.accessToken;
          state.refreshToken = action.payload.tokens.refreshToken || null;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.activeRole = mapBackendRoleToAppRole(action.payload.user.roles);
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
        }
      })
      .addCase(checkAuthSessionThunk.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });

    // 2. Login Thunk
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.isAuthenticated = true;
        state.data = action.payload;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user;
        state.activeRole = mapBackendRoleToAppRole(action.payload.user.roles);
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = (action.payload as string) || 'Invalid email or password';
      });

    // 3. Sync User Profile when refreshed or updated
    builder.addCase(getProfileThunk.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // 4. Logout Thunk
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.activeRole = 'technician';
      state.error = null;
      state.data = null;
    });
  },
});

export const { restoreLoginDetail, clearAuthError, setActiveRole, logoutAction } = loginSlice.actions;
export default loginSlice.reducer;

