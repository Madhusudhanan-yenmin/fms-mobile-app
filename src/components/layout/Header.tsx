import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { APP_ROLES, AppRole } from '../../constants/roles';
import { useTheme } from '../../context';

interface HeaderProps {
  currentRole: AppRole;
  onOpenRoleSwitcher: () => void;
  onOpenNotifications?: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onOpenRoleSwitcher,
  onOpenNotifications,
  title,
  showBack = false,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const roleInfo = APP_ROLES[currentRole] || APP_ROLES['technician'];

  // Calculate safe status bar padding for Android, iOS notches/Dynamic Island, and Web
  // Modern Android hole-punch / camera cutout status bars are 36-48px high.
  const androidStatusHeight = RNStatusBar.currentHeight || 36;
  const safeTopPadding = Platform.OS === 'android'
    ? Math.max(androidStatusHeight, insets.top, 36) + 10
    : Math.max(insets.top, 16) + 8;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeTopPadding,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoBadge}>
              <Feather name="zap" size={15} color={Colors.white} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.brandTitle, { color: colors.text }]} numberOfLines={1}>
              Smart Campus FMS
            </Text>
            <Text
              style={[
                styles.brandSubtitle,
                { color: isDark ? colors.primary : Colors.primaryDark },
              ]}
              numberOfLines={1}
            >
              Yenmin Communications
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {/* Quick Light/Dark Mode Switcher */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme"
          >
            <Feather
              name={isDark ? 'sun' : 'moon'}
              size={14}
              color={isDark ? '#FBBF24' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rolePickerBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
            onPress={onOpenRoleSwitcher}
            activeOpacity={0.7}
          >
            <View style={[styles.roleDot, { backgroundColor: roleInfo.badgeColor }]} />
            <Text style={[styles.rolePickerText, { color: colors.text }]} numberOfLines={1}>
              {roleInfo.shortLabel}
            </Text>
            <Feather name="chevron-down" size={13} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {title && (
        <View style={styles.pageTitleRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>{title}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    padding: 4,
    marginRight: 4,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.primaryDark,
    letterSpacing: 0.2,
  },
  rolePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  rolePickerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    maxWidth: 110,
  },
  pageTitleRow: {
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
});
