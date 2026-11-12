import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationModalProps {
  visible: boolean;
  type?: ConfirmationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: keyof typeof Feather.glyphMap;
  showCancel?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userPreview?: {
    name: string;
    subtitle?: string;
    initials?: string;
  };
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  type = 'danger',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmIcon,
  showCancel = true,
  loading = false,
  onConfirm,
  onCancel,
  userPreview,
}) => {
  const { colors, isDark } = useTheme();

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          outerBg: isDark ? '#3E1818' : '#FEE2E2',
          innerBg: isDark ? '#2D1212' : '#FEF2F2',
          borderColor: isDark ? '#7F1D1D' : '#FECACA',
          iconColor: '#DC2626',
          confirmBtnBg: '#DC2626',
          defaultIcon: 'log-out' as keyof typeof Feather.glyphMap,
        };
      case 'success':
        return {
          outerBg: isDark ? '#143825' : '#D1FAE5',
          innerBg: isDark ? '#0F291C' : '#ECFDF5',
          borderColor: isDark ? '#065F46' : '#A7F3D0',
          iconColor: '#059669',
          confirmBtnBg: '#059669',
          defaultIcon: 'check' as keyof typeof Feather.glyphMap,
        };
      case 'warning':
        return {
          outerBg: isDark ? '#3D2A10' : '#FEF3C7',
          innerBg: isDark ? '#2E1F0B' : '#FFFBEB',
          borderColor: isDark ? '#78350F' : '#FDE68A',
          iconColor: '#D97706',
          confirmBtnBg: '#D97706',
          defaultIcon: 'alert-triangle' as keyof typeof Feather.glyphMap,
        };
      case 'info':
      default:
        return {
          outerBg: isDark ? '#1E293B' : '#DBEAFE',
          innerBg: isDark ? '#172033' : '#EFF6FF',
          borderColor: isDark ? '#2563EB' : '#BFDBFE',
          iconColor: colors.primary,
          confirmBtnBg: colors.primary,
          defaultIcon: 'info' as keyof typeof Feather.glyphMap,
        };
    }
  };

  const config = getTypeConfig();
  const iconName = confirmIcon || config.defaultIcon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable area */}
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          {/* Modern Outer Glow Ring & Icon Badge */}
          <View style={[styles.outerRing, { backgroundColor: config.outerBg }]}>
            <View
              style={[
                styles.innerRing,
                {
                  backgroundColor: config.innerBg,
                  borderColor: config.borderColor,
                },
              ]}
            >
              <Feather name={iconName} size={26} color={config.iconColor} />
            </View>
          </View>

          {/* Title & Body */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          {/* Optional User / Identity Preview Chip */}
          {userPreview && (
            <View
              style={[
                styles.userCard,
                {
                  backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {userPreview.initials ||
                    userPreview.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {userPreview.name}
                </Text>
                {userPreview.subtitle && (
                  <Text
                    style={[styles.userSubtitle, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {userPreview.subtitle}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            {showCancel && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  },
                ]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.confirmBtn,
                { backgroundColor: config.confirmBtnBg },
                !showCancel && { flex: 1 },
                loading && { opacity: 0.75 },
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name={iconName} size={16} color="#FFFFFF" />
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 14,
  },
  outerRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  innerRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  userCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  userSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
