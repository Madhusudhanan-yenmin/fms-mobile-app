import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { APP_ROLES, AppRole } from '../../constants/roles';
import { useTheme } from '../../context';

interface RoleSwitcherModalProps {
  visible: boolean;
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  visible,
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const bottomPadding = Math.max(insets.bottom, 24) + 24;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Switch Mobile Persona</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Select a role to preview dynamic tabs & features
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' },
              ]}
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.roleList}
            contentContainerStyle={{ paddingBottom: bottomPadding }}
            showsVerticalScrollIndicator={true}
          >
              {(Object.keys(APP_ROLES) as AppRole[]).map((roleKey) => {
                const item = APP_ROLES[roleKey];
                const isSelected = currentRole === roleKey;

                return (
                  <TouchableOpacity
                    key={roleKey}
                    style={[
                      styles.roleItem,
                      {
                        backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                        borderColor: isDark ? '#27354A' : '#E9DED0',
                      },
                      isSelected && [
                        styles.roleItemSelected,
                        {
                          backgroundColor: isDark ? '#2D1C12' : '#FFF9F2',
                          borderColor: colors.primary,
                        },
                      ],
                    ]}
                    onPress={() => {
                      onSelectRole(roleKey);
                      onClose();
                    }}
                  >
                    <View style={[styles.roleIndicator, { backgroundColor: item.badgeColor }]} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text
                          style={[
                            styles.roleLabel,
                            { color: colors.text },
                            isSelected && { color: colors.primary },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && <Feather name="check-circle" size={18} color={colors.primary} />}
                      </View>
                      <Text style={[styles.roleDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <View
                        style={[
                          styles.deptBadge,
                          { backgroundColor: isDark ? '#1E293B' : '#F9F6F0' },
                        ]}
                      >
                        <Feather name="briefcase" size={11} color={colors.textSecondary} />
                        <Text style={[styles.deptText, { color: colors.textSecondary }]}>
                          {item.department} • {item.avatar}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  roleList: {
    flexGrow: 0,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  roleItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceHover,
  },
  roleIndicator: {
    width: 4,
    height: 38,
    borderRadius: 2,
    marginRight: 12,
    marginTop: 2,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  roleDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.background,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  deptText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

