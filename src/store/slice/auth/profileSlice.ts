import { createSlice } from '@reduxjs/toolkit';
import { AuthUser } from '../../../types/auth.types';
import { getProfileThunk, updateProfileThunk } from '../../asyncThunks/auth';

export interface ProfileState {
  data: any | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  user: null,
  loading: false,
  error: null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    restoreProfileDetail: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Get Profile
    builder
      .addCase(getProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.user = action.payload;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch user profile';
      });

    // 2. Update Profile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.user = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update user profile';
      });
  },
});

export const { restoreProfileDetail } = profileSlice.actions;
export default profileSlice.reducer;

