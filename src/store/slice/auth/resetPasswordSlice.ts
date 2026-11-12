import { createSlice } from '@reduxjs/toolkit';
import { resetPasswordThunk } from '../../asyncThunks/auth';

export interface ResetPasswordState {
  data: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ResetPasswordState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

export const resetPasswordSlice = createSlice({
  name: 'resetPassword',
  initialState,
  reducers: {
    restoreResetPassword: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || 'Failed to reset password';
      });
  },
});

export const { restoreResetPassword } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
