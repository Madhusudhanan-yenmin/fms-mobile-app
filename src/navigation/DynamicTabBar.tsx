import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { ROLE_NAVIGATION_TABS } from '../constants/navigation';
import { AppRole } from '../constants/roles';
import { useTheme } from '../context';
import { useAppSelector } from '../store';

interface DynamicTabBarProps {
  currentRole: AppRole;
  activeTabKey: string;
  onSelectTab: (tabKey: string) => void;
}

export const DynamicTabBar: React.FC<DynamicTabBarProps> = ({
  currentRole,
  activeTabKey,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const complaints = useAppSelector((state) => state.complaints.items);
  const openComplaintsCount = useMemo(
    () =>
      complaints.filter((item) =>
        ['Raised', 'Assigned', 'In Progress'].includes(item.status)
      ).length,
    [complaints]
  );
  const tabs = ROLE_NAVIGATION_TABS[currentRole] || ROLE_NAVIGATION_TABS['technician'] || [];
  const safeBottom = Math.max(insets.bottom, 8) + 6;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: safeBottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTabKey === tab.key;
        const iconColor = isActive ? colors.primary : colors.textMuted;
        const displayBadgeCount =
          tab.key === 'staff_complaints' ? openComplaintsCount : tab.badgeCount;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Feather name={tab.iconName as any} size={20} color={iconColor} />
              {Boolean(displayBadgeCount && displayBadgeCount > 0) && (
                <View style={[styles.badge, { borderColor: colors.surface }]}>
                  <Text style={styles.badgeText}>
                    {displayBadgeCount! > 99 ? '99+' : displayBadgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: iconColor, fontWeight: isActive ? '800' : '500' },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
});
