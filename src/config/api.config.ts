import { Platform } from 'react-native';

/**
 * API Configuration for Yenmin Smart Campus FMS Mobile App
 * 
 * Adjust LAN_IP if your computer's local Wi-Fi IP address changes.
 * Current Wi-Fi IP: 192.168.1.18
 */
export const BACKEND_PORT = 3000;
export const BACKEND_LAN_IP = '192.168.1.18';

const getBaseUrl = (): string => {
  // If running on web in browser
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}/api/v1`;
  }

  // Physical Android/iOS device running Expo Go over Wi-Fi
  return `http://${BACKEND_LAN_IP}:${BACKEND_PORT}/api/v1`;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000, // 15 seconds
  ENDPOINTS: {
    // Auth & Profile
    LOGIN: '/auth/login',
    SIGNIN: '/auth/signin',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
};

