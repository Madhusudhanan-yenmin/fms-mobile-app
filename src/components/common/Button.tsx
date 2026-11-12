import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
}) => {
  const { colors } = useTheme();

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'secondary':
        return {
          backgroundColor: colors.primaryLight,
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
        return colors.text;
      case 'secondary':
        return colors.primaryDark;
      case 'danger':
      case 'primary':
      default:
        return Colors.white;
    }
  };

  const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
    md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    lg: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.baseButton,
        getButtonStyles(),
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && <Feather name={icon} size={currentSize.fontSize + 2} color={getTextColor()} style={{ marginRight: 6 }} />}
          <Text style={[styles.text, { color: getTextColor(), fontSize: currentSize.fontSize }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

