import { createSlice } from '@reduxjs/toolkit';
import { changePasswordThunk } from '../../asyncThunks/auth';

export interface ChangePasswordState {
  data: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ChangePasswordState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

export const changePasswordSlice = createSlice({
  name: 'changePassword',
  initialState,
  reducers: {
    restoreChangePassword: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || 'Failed to change password. Please verify current password.';
      });
  },
});

export const { restoreChangePassword } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;

