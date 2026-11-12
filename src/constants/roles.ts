/**
 * Official System & Database Roles for Yenmin Smart Campus FMS
 * Directly aligned with PostgreSQL seeded roles from backend (yenmin_fms_be)
 */

export type AppRole =
  | 'super-admin'
  | 'administrator'
  | 'management'
  | 'facility-head'
  | 'maintenance-supervisor'
  | 'technician'
  | 'housekeeping-supervisor'
  | 'lab-in-charge'
  | 'it-team'
  | 'store-inventory'
  | 'vendor-contractor'
  | 'staff-teacher'
  | 'student-parent';

export interface RoleConfig {
  id: AppRole;
  label: string;
  shortLabel: string;
  department: string;
  avatar: string;
  description: string;
  badgeColor: string;
}

export const APP_ROLES: Record<AppRole, RoleConfig> = {
  'super-admin': {
    id: 'super-admin',
    label: 'Super Admin',
    shortLabel: 'Super Admin',
    department: 'Institution Administration',
    avatar: 'Madhusudhanan K',
    description: 'Full institutional authority across campuses, master settings, and user access control',
    badgeColor: '#1E293B',
  },
  administrator: {
    id: 'administrator',
    label: 'Administrator',
    shortLabel: 'Admin',
    department: 'Administration & Finances',
    avatar: 'Silvia',
    description: 'System-wide operations, facility budgets, and administrative policy compliance',
    badgeColor: '#334155',
  },
  management: {
    id: 'management',
    label: 'Management / Principal',
    shortLabel: 'Management',
    department: 'Executive Leadership',
    avatar: 'Principal / Management',
    description: 'Executive oversight, capital expenditure approvals, and statutory compliance reviews',
    badgeColor: '#4F46E5',
  },
  'facility-head': {
    id: 'facility-head',
    label: 'Facility Head',
    shortLabel: 'Facility Head',
    department: 'Facility Management',
    avatar: 'Sidhu',
    description: 'Campus facility planning, civil infrastructure, space allocation, and daily operations',
    badgeColor: '#EA580C',
  },
  'maintenance-supervisor': {
    id: 'maintenance-supervisor',
    label: 'Maintenance Supervisor',
    shortLabel: 'Supervisor',
    department: 'Civil & MEP Maintenance',
    avatar: 'Suresh Babu',
    description: 'Coordinate maintenance work orders, assign technicians, and verify repair quality',
    badgeColor: '#D97706',
  },
  technician: {
    id: 'technician',
    label: 'Technician',
    shortLabel: 'Technician',
    department: 'Electrical & HVAC',
    avatar: 'Kumar (Tech)',
    description: 'Handle assigned complaints, asset breakdowns, repairs, and preventive servicing',
    badgeColor: '#2563EB',
  },
  'housekeeping-supervisor': {
    id: 'housekeeping-supervisor',
    label: 'Housekeeping Supervisor',
    shortLabel: 'Housekeeping',
    department: 'Housekeeping & Sanitation',
    avatar: 'Kumar (HK)',
    description: 'Oversee daily campus hygiene, cleaning schedules, sanitation, and waste handling',
    badgeColor: '#059669',
  },
  'lab-in-charge': {
    id: 'lab-in-charge',
    label: 'Lab In-charge',
    shortLabel: 'Lab In-charge',
    department: 'Academic Laboratories',
    avatar: 'Dr. S. Meenakshi',
    description: 'Manage laboratory apparatus, safety compliance checklists, and equipment servicing',
    badgeColor: '#7C3AED',
  },
  'it-team': {
    id: 'it-team',
    label: 'IT Team',
    shortLabel: 'IT Team',
    department: 'IT & Network Infrastructure',
    avatar: 'Gayathri (IT)',
    description: 'Campus network backbone, smart classrooms, hardware, biometric devices, and IT helpdesk',
    badgeColor: '#0284C7',
  },
  'store-inventory': {
    id: 'store-inventory',
    label: 'Store / Inventory',
    shortLabel: 'Store / Stock',
    department: 'Central Store',
    avatar: 'Venkatesh',
    description: 'Manage maintenance materials, spare parts, consumables, and material requests',
    badgeColor: '#B45309',
  },
  'vendor-contractor': {
    id: 'vendor-contractor',
    label: 'Vendor / Contractor',
    shortLabel: 'Vendor / AMC',
    department: 'External Service Partners',
    avatar: 'Santhosh (AMC)',
    description: 'Manage Annual Maintenance Contracts, warranty coverage, and external service visits',
    badgeColor: '#9333EA',
  },
  'staff-teacher': {
    id: 'staff-teacher',
    label: 'Staff / Teacher',
    shortLabel: 'Staff / Teacher',
    department: 'Academic Faculty',
    avatar: 'Gayathri (Staff)',
    description: 'Report classroom & lab issues, scan facility QR codes, and track service requests',
    badgeColor: '#16A34A',
  },
  'student-parent': {
    id: 'student-parent',
    label: 'Student / Parent',
    shortLabel: 'Student / Parent',
    department: 'Campus Community',
    avatar: 'Campus Student',
    description: 'Raise campus cleanliness complaints, safety concerns, and service feedback',
    badgeColor: '#0D9488',
  },
};

export const DEFAULT_ROLE: AppRole = 'technician';
