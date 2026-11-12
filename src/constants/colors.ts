export const LightColors = {
  primary: '#F16E00',
  primaryDark: '#C65300',
  primaryLight: '#FFF0DF',
  primaryMuted: '#FFF8ED',

  background: '#F9F6F0',
  surface: '#FFFFFF',
  surfaceHover: '#FFF9F2',

  border: '#E9DED0',
  borderLight: '#F3EDE4',

  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',

  white: '#FFFFFF',
  black: '#000000',

  // Status Colors
  statusRaised: '#F59E0B',
  statusAssigned: '#3B82F6',
  statusInProgress: '#8B5CF6',
  statusResolved: '#10B981',
  statusVerified: '#059669',
  statusClosed: '#6B7280',

  // Priorities
  priorityLow: '#10B981',
  priorityMedium: '#3B82F6',
  priorityHigh: '#F59E0B',
  priorityCritical: '#EF4444',

  // Badges & Backgrounds
  badgeGreenBg: '#ECFDF5',
  badgeGreenText: '#065F46',
  badgeBlueBg: '#EFF6FF',
  badgeBlueText: '#1E40AF',
  badgeAmberBg: '#FFFBEB',
  badgeAmberText: '#92400E',
  badgeRedBg: '#FEF2F2',
  badgeRedText: '#991B1B',
  badgePurpleBg: '#F5F3FF',
  badgePurpleText: '#5B21B6',
  badgeGrayBg: '#F3F4F6',
  badgeGrayText: '#374151',
};

export type ThemeColors = typeof LightColors;

export const DarkColors: ThemeColors = {
  primary: '#F16E00',
  primaryDark: '#D95F00',
  primaryLight: '#2D1C12',
  primaryMuted: '#20160F',

  background: '#0B0F19', // Deep dark slate background
  surface: '#151C2C',    // Elevated slate card & header surface
  surfaceHover: '#1E293B',

  border: '#27354A',     // High-definition slate border
  borderLight: '#1B2435',

  text: '#F8FAFC',       // Crisp bright white/slate text
  textSecondary: '#94A3B8', // Muted slate secondary text
  textMuted: '#64748B',  // Tertiary/placeholder text

  white: '#FFFFFF',
  black: '#000000',

  // Status Colors in Dark Mode (High contrast, vibrant)
  statusRaised: '#FBBF24',
  statusAssigned: '#60A5FA',
  statusInProgress: '#A78BFA',
  statusResolved: '#34D399',
  statusVerified: '#10B981',
  statusClosed: '#9CA3AF',

  // Priorities in Dark Mode
  priorityLow: '#34D399',
  priorityMedium: '#60A5FA',
  priorityHigh: '#FBBF24',
  priorityCritical: '#F87171',

  // Badges & Backgrounds in Dark Mode
  badgeGreenBg: '#064E3B',
  badgeGreenText: '#6EE7B7',
  badgeBlueBg: '#1E3A8A',
  badgeBlueText: '#93C5FD',
  badgeAmberBg: '#78350F',
  badgeAmberText: '#FCD34D',
  badgeRedBg: '#7F1D1D',
  badgeRedText: '#FCA5A5',
  badgePurpleBg: '#4C1D95',
  badgePurpleText: '#C4B5FD',
  badgeGrayBg: '#1E293B',
  badgeGrayText: '#CBD5E1',
};

// Default export maintained for existing static usages
export const Colors = LightColors;
