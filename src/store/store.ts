import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Auth Slices (Modular pattern compliant with web app)
import loginReducer from './slice/auth/loginSlice';
import profileReducer from './slice/auth/profileSlice';
import changePasswordReducer from './slice/auth/changePasswordSlice';
import forgotPasswordReducer from './slice/auth/forgotPasswordSlice';
import resetPasswordReducer from './slice/auth/resetPasswordSlice';

const rootReducer = combineReducers({
  // Auth Slices
  login: loginReducer,
  profile: profileReducer,
  changePassword: changePasswordReducer,
  forgotPassword: forgotPasswordReducer,
  resetPassword: resetPasswordReducer,

  // Compatibility alias for components using state.auth
  auth: loginReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Custom typed hooks for use throughout the mobile app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;

