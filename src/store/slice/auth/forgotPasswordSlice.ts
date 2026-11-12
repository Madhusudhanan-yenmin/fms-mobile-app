import { createSlice } from '@reduxjs/toolkit';
import { forgotPasswordThunk } from '../../asyncThunks/auth';

export interface ForgotPasswordState {
  data: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ForgotPasswordState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

export const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    restoreForgotPassword: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || 'Failed to request recovery code';
      });
  },
});

export const { restoreForgotPassword } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
