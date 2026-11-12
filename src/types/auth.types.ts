import { AppRole } from '../constants/roles';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  roles: string[];
  permissions?: string[];
  isActive?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  department?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: any | null;
  meta?: any;
}

/**
 * Maps database/backend roles (e.g., 'super-admin', 'facility-head', 'it-team')
 * directly to the 13 official database AppRole keys.
 */
export const mapBackendRoleToAppRole = (roles?: string[]): AppRole => {
  if (!roles || roles.length === 0) return 'technician';

  const normalized = roles.map((r) => r.toLowerCase().trim());

  // 1. Direct exact match with official DB codes
  const validRoles: AppRole[] = [
    'super-admin',
    'administrator',
    'management',
    'facility-head',
    'maintenance-supervisor',
    'technician',
    'housekeeping-supervisor',
    'lab-in-charge',
    'it-team',
    'store-inventory',
    'vendor-contractor',
    'staff-teacher',
    'student-parent',
  ];

  for (const role of validRoles) {
    if (normalized.includes(role)) {
      return role;
    }
  }

  // 2. Intelligent fuzzy mapping
  const roleStr = normalized.join(' ');

  if (roleStr.includes('super-admin') || roleStr.includes('super admin')) return 'super-admin';
  if (roleStr.includes('administrator') || roleStr.includes('admin')) return 'administrator';
  if (roleStr.includes('management') || roleStr.includes('principal')) return 'management';
  if (roleStr.includes('facility-head') || roleStr.includes('facility head')) return 'facility-head';
  if (roleStr.includes('maintenance-supervisor') || roleStr.includes('supervisor')) return 'maintenance-supervisor';
  if (roleStr.includes('housekeeping')) return 'housekeeping-supervisor';
  if (roleStr.includes('lab')) return 'lab-in-charge';
  if (roleStr.includes('it-team') || roleStr.includes('it') || roleStr.includes('network')) return 'it-team';
  if (roleStr.includes('store') || roleStr.includes('inventory')) return 'store-inventory';
  if (roleStr.includes('vendor') || roleStr.includes('amc') || roleStr.includes('contractor')) return 'vendor-contractor';
  if (roleStr.includes('teacher') || roleStr.includes('staff') || roleStr.includes('faculty')) return 'staff-teacher';
  if (roleStr.includes('student') || roleStr.includes('parent')) return 'student-parent';
  if (roleStr.includes('technician') || roleStr.includes('tech') || roleStr.includes('electrician') || roleStr.includes('plumber')) return 'technician';

  return 'technician';
};
