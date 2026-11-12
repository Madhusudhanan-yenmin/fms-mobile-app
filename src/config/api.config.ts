import { Platform, NativeModules, TurboModuleRegistry } from 'react-native';

/**
 * API Configuration for Yenmin Smart Campus FMS Mobile App
 *
 * Automatically resolves the host machine's LAN IPv4 address from the active
 * Metro/Expo Go dev server URL whenever Wi-Fi or mobile hotspot changes,
 * falling back to BACKEND_LAN_IP if unavailable.
 * Current Wi-Fi IP: 10.86.64.175
 */
export const BACKEND_PORT = 3000;
export const BACKEND_LAN_IP = '10.86.64.175';

const extractIpv4FromUrl = (url?: string | null): string | null => {
  if (typeof url !== 'string') return null;
  const match = url.match(/^[a-zA-Z]+:\/\/(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:\/|$)/);
  const ip = match?.[1];
  if (ip && ip !== '127.0.0.1' && ip !== '0.0.0.0') {
    return ip;
  }
  return null;
};

const getDevServerHostIp = (): string | null => {
  try {
    // 1. React Native Metro bundle scriptURL (works in Expo Go & RN dev builds)
    const sourceCodeModule: any =
      TurboModuleRegistry?.get?.('SourceCode') || NativeModules?.SourceCode;
    const scriptURL: string | undefined =
      sourceCodeModule?.getConstants?.()?.scriptURL || sourceCodeModule?.scriptURL;

    const scriptIp = extractIpv4FromUrl(scriptURL);
    if (scriptIp) return scriptIp;

    // 2. Expo Go native constants URL fallback (e.g. exp://10.86.64.175:8081)
    const expoConstants: any =
      TurboModuleRegistry?.get?.('ExponentConstants') || NativeModules?.ExponentConstants;
    const expIp =
      extractIpv4FromUrl(expoConstants?.experienceUrl) ||
      extractIpv4FromUrl(expoConstants?.linkingUri);
    if (expIp) return expIp;
  } catch {
    // Safe fallback to configured BACKEND_LAN_IP
  }
  return null;
};

const getBaseUrl = (): string => {
  // If running on web in browser
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}/api/v1`;
  }

  // Physical Android/iOS device running Expo Go over Wi-Fi / Hotspot
  const hostIp = getDevServerHostIp() || BACKEND_LAN_IP;
  return `http://${hostIp}:${BACKEND_PORT}/api/v1`;
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

    // Complaints, QR Scan & Locations (Phase 1)
    COMPLAINTS: '/complaints',
    COMPLAINT_CATEGORIES: '/complaint-categories',
    PUBLIC_QR_REPORT: '/complaints/public/qr-report',
    ASSET_SCAN: '/assets/scan',
    LOCATIONS_SCAN: '/locations/scan',
    LOCATIONS_TREE: '/locations/tree',
  },
};

