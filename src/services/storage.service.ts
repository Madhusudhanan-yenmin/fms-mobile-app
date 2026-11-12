import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, AuthUser } from '../types/auth.types';

// SecureStore keys only allow alphanumeric, '.', '-', and '_'
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fms_access_token',
  REFRESH_TOKEN: 'fms_refresh_token',
  USER_DATA: 'fms_user_data',
  ACTIVE_ROLE: 'fms_active_role',
  THEME_MODE: 'fms_theme_mode',
};

// In-memory fallback
const memoryStore: Record<string, string> = {};

let isSecureStoreSupported: boolean | null = null;
const checkSecureStore = async (): Promise<boolean> => {
  if (isSecureStoreSupported !== null) return isSecureStoreSupported;
  try {
    if (SecureStore && typeof SecureStore.isAvailableAsync === 'function') {
      isSecureStoreSupported = await SecureStore.isAvailableAsync();
      return isSecureStoreSupported;
    }
  } catch {
    // secure store unavailable
  }
  isSecureStoreSupported = false;
  return false;
};

const safeGetItem = async (key: string): Promise<string | null> => {
  // 1. Try Expo SecureStore (preferred in Expo Go & React Native)
  try {
    const hasSecure = await checkSecureStore();
    if (hasSecure && SecureStore.getItemAsync) {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch {
    // fallback
  }

  // 2. Try AsyncStorage (if native module available)
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch {
    // fallback
  }

  // 3. Fallback to in-memory store
  return memoryStore[key] || null;
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  memoryStore[key] = value;

  // 1. Try Expo SecureStore
  try {
    const hasSecure = await checkSecureStore();
    if (hasSecure && SecureStore.setItemAsync) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch {
    // fallback
  }

  // 2. Try AsyncStorage
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(key, value);
    }
  } catch {
    // In-memory store already holds value
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  delete memoryStore[key];

  // 1. Try Expo SecureStore
  try {
    const hasSecure = await checkSecureStore();
    if (hasSecure && SecureStore.deleteItemAsync) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    // fallback
  }

  // 2. Try AsyncStorage
  try {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // fallback
  }
};

export const StorageService = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await safeSetItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      await safeSetItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
  },

  async getAccessToken(): Promise<string | null> {
    return await safeGetItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await safeGetItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await safeGetItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await safeGetItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!accessToken) return null;
    return {
      accessToken,
      refreshToken: refreshToken || undefined,
    };
  },

  async saveUser(user: AuthUser): Promise<void> {
    await safeSetItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUser(): Promise<AuthUser | null> {
    const json = await safeGetItem(STORAGE_KEYS.USER_DATA);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  async clearAuthData(): Promise<void> {
    await safeRemoveItem(STORAGE_KEYS.ACCESS_TOKEN);
    await safeRemoveItem(STORAGE_KEYS.REFRESH_TOKEN);
    await safeRemoveItem(STORAGE_KEYS.USER_DATA);
    await safeRemoveItem(STORAGE_KEYS.ACTIVE_ROLE);
  },

  async saveThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    await safeSetItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  async getThemeMode(): Promise<'light' | 'dark' | 'system' | null> {
    const mode = await safeGetItem(STORAGE_KEYS.THEME_MODE);
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      return mode;
    }
    return null;
  },
};

export const storageService = StorageService;
