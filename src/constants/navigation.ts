import { AppRole } from './roles';

export interface TabConfig {
  key: string;
  label: string;
  iconName: string; // feather icon name
  badgeCount?: number;
}

export const ROLE_NAVIGATION_TABS: Record<AppRole, TabConfig[]> = {
  'super-admin': [
    { key: 'admin_dashboard', label: 'Dashboard', iconName: 'activity' },
    { key: 'admin_operations', label: 'Operations', iconName: 'settings' },
    { key: 'admin_users', label: 'Users & Access', iconName: 'users' },
    { key: 'admin_alerts', label: 'Alerts', iconName: 'bell', badgeCount: 4 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  administrator: [
    { key: 'admin_dashboard', label: 'Dashboard', iconName: 'activity' },
    { key: 'admin_operations', label: 'Operations', iconName: 'settings' },
    { key: 'admin_users', label: 'Users & Access', iconName: 'users' },
    { key: 'admin_alerts', label: 'Alerts', iconName: 'bell', badgeCount: 2 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  management: [
    { key: 'sup_dashboard', label: 'Overview', iconName: 'pie-chart' },
    { key: 'sup_approvals', label: 'Approvals', iconName: 'check-circle', badgeCount: 3 },
    { key: 'sup_reports', label: 'Reports', iconName: 'bar-chart-2' },
    { key: 'notifications', label: 'Alerts', iconName: 'bell' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'facility-head': [
    { key: 'sup_dashboard', label: 'Dashboard', iconName: 'pie-chart' },
    { key: 'sup_issues', label: 'Issues', iconName: 'layers', badgeCount: 5 },
    { key: 'sup_assignments', label: 'Assignments', iconName: 'user-check' },
    { key: 'sup_approvals', label: 'Approvals', iconName: 'check-circle', badgeCount: 2 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'maintenance-supervisor': [
    { key: 'sup_dashboard', label: 'Dashboard', iconName: 'pie-chart' },
    { key: 'sup_issues', label: 'Breakdowns', iconName: 'layers', badgeCount: 3 },
    { key: 'tech_tasks', label: 'PPM Tasks', iconName: 'check-square' },
    { key: 'sup_approvals', label: 'Approvals', iconName: 'check-circle', badgeCount: 1 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  technician: [
    { key: 'tech_home', label: 'Home', iconName: 'home' },
    { key: 'tech_issues', label: 'My Issues', iconName: 'alert-circle', badgeCount: 3 },
    { key: 'tech_tasks', label: 'My Tasks', iconName: 'check-square' },
    { key: 'notifications', label: 'Notifications', iconName: 'bell', badgeCount: 2 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'housekeeping-supervisor': [
    { key: 'hk_home', label: 'Home', iconName: 'home' },
    { key: 'hk_tasks', label: 'Cleaning Tasks', iconName: 'clipboard', badgeCount: 4 },
    { key: 'hk_report', label: 'Report Issue', iconName: 'plus-circle' },
    { key: 'notifications', label: 'Notifications', iconName: 'bell' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'lab-in-charge': [
    { key: 'tech_home', label: 'Lab Overview', iconName: 'home' },
    { key: 'safety_inspections', label: 'Inspections', iconName: 'shield', badgeCount: 2 },
    { key: 'staff_raise', label: 'Report Issue', iconName: 'plus-circle' },
    { key: 'notifications', label: 'Notifications', iconName: 'bell' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'it-team': [
    { key: 'tech_home', label: 'IT Helpdesk', iconName: 'home' },
    { key: 'tech_issues', label: 'Tickets', iconName: 'alert-circle', badgeCount: 4 },
    { key: 'inv_stock', label: 'IT Assets', iconName: 'box' },
    { key: 'notifications', label: 'Alerts', iconName: 'bell', badgeCount: 1 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'store-inventory': [
    { key: 'inv_home', label: 'Home', iconName: 'home' },
    { key: 'inv_stock', label: 'Stock', iconName: 'box' },
    { key: 'inv_requests', label: 'Material Req', iconName: 'shopping-cart', badgeCount: 3 },
    { key: 'inv_history', label: 'Stock History', iconName: 'list' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'vendor-contractor': [
    { key: 'amc_home', label: 'Home', iconName: 'home' },
    { key: 'amc_contracts', label: 'AMC Contracts', iconName: 'file-text' },
    { key: 'amc_visits', label: 'Service Visits', iconName: 'calendar', badgeCount: 1 },
    { key: 'amc_renewals', label: 'Renewals', iconName: 'clock', badgeCount: 2 },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'staff-teacher': [
    { key: 'staff_home', label: 'Home', iconName: 'home' },
    { key: 'staff_scan', label: 'Scan QR', iconName: 'maximize' },
    { key: 'staff_raise', label: 'Raise Issue', iconName: 'plus-circle' },
    { key: 'staff_complaints', label: 'My Complaints', iconName: 'file-text' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
  'student-parent': [
    { key: 'staff_home', label: 'Home', iconName: 'home' },
    { key: 'staff_raise', label: 'Report Issue', iconName: 'plus-circle' },
    { key: 'staff_complaints', label: 'My Complaints', iconName: 'file-text' },
    { key: 'notifications', label: 'Notifications', iconName: 'bell' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ],
};
