import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  const { colors, isDark } = useTheme();

  const getBadgeStyle = () => {
    const s = (status || '').toLowerCase();
    
    if (s === 'critical' || s === 'expired' || s === 'out of stock' || s === 'action required') {
      return {
        bg: colors.badgeRedBg,
        text: colors.badgeRedText,
        border: isDark ? '#7F1D1D' : '#FECACA',
      };
    }
    if (s === 'high' || s === 'expiring soon' || s === 'low stock' || s === 'raised') {
      return {
        bg: colors.badgeAmberBg,
        text: colors.badgeAmberText,
        border: isDark ? '#78350F' : '#FDE68A',
      };
    }
    if (s === 'in progress' || s === 'audit in progress') {
      return {
        bg: colors.badgePurpleBg,
        text: colors.badgePurpleText,
        border: isDark ? '#4C1D95' : '#DDD6FE',
      };
    }
    if (s === 'assigned' || s === 'scheduled' || s === 'medium') {
      return {
        bg: colors.badgeBlueBg,
        text: colors.badgeBlueText,
        border: isDark ? '#1E3A8A' : '#BFDBFE',
      };
    }
    if (s === 'resolved' || s === 'verified' || s === 'active' || s === 'in stock' || s === 'completed' || s === 'passed' || s === 'low') {
      return {
        bg: colors.badgeGreenBg,
        text: colors.badgeGreenText,
        border: isDark ? '#065F46' : '#A7F3D0',
      };
    }
    
    return {
      bg: colors.badgeGrayBg,
      text: colors.badgeGrayText,
      border: isDark ? '#374151' : '#E5E7EB',
    };
  };

  const current = getBadgeStyle();

  return (
    <View style={[styles.badgeContainer, { backgroundColor: current.bg, borderColor: current.border }]}>
      <Text style={[styles.badgeText, { color: current.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

