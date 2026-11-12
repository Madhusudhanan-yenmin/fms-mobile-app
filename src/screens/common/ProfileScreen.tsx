import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as yup from 'yup';
import { Colors } from '../../constants/colors';
import { APP_ROLES, AppRole } from '../../constants/roles';
import { Card, Button, ConfirmationModal } from '../../components';
import { useTheme } from '../../context';
import {
  useAppDispatch,
  useAppSelector,
  changePasswordThunk,
  getProfileThunk,
  logoutThunk,
  restoreChangePassword,
} from '../../store';
import { changePasswordYupSchema } from '../../helpers/validation.helper';
import { EditProfileScreen } from './EditProfileScreen';

interface ProfileScreenProps {
  currentRole: AppRole;
  onOpenRoleSwitcher?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentRole }) => {
  const dispatch = useAppDispatch();
  const { colors, isDark, mode, setThemeMode } = useTheme();
  const user = useAppSelector((state) => state.login.user);
  const {
    loading: changePasswordLoading,
    success: changePasswordSuccess,
    error: changePasswordError,
  } = useAppSelector((state) => state.changePassword);

  const [refreshing, setRefreshing] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live Yup validation state
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    currentPassword?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  const roleInfo = APP_ROLES[currentRole] || APP_ROLES['technician'];

  // Refresh profile from API on mount
  useEffect(() => {
    dispatch(getProfileThunk());
  }, [dispatch]);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getProfileThunk());
    setRefreshing(false);
  };

  // Live field-level Yup validation
  const validateField = async (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    val: string,
    overrides?: { currentPassword?: string; newPassword?: string; confirmPassword?: string }
  ) => {
    try {
      const data = {
        currentPassword: field === 'currentPassword' ? val : currentPassword,
        newPassword: field === 'newPassword' ? val : newPassword,
        confirmPassword: field === 'confirmPassword' ? val : confirmPassword,
        ...overrides,
      };

      await changePasswordYupSchema.validateAt(field, data);

      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: err.message,
        }));
      }
    }
  };

  const handleCurrentPasswordChange = (val: string) => {
    setCurrentPassword(val);
    if (changePasswordError) dispatch(restoreChangePassword());
    if (touched.currentPassword || val.length > 0) {
      validateField('currentPassword', val);
    }
  };

  const handleNewPasswordChange = (val: string) => {
    setNewPassword(val);
    if (changePasswordError) dispatch(restoreChangePassword());
    if (touched.newPassword || val.length > 0) {
      validateField('newPassword', val);
    }
    if (touched.confirmPassword && confirmPassword.length > 0) {
      validateField('confirmPassword', confirmPassword, { newPassword: val });
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (changePasswordError) dispatch(restoreChangePassword());
    if (touched.confirmPassword || val.length > 0) {
      validateField('confirmPassword', val);
    }
  };

  const handleBlur = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === 'currentPassword'
        ? currentPassword
        : field === 'newPassword'
        ? newPassword
        : confirmPassword;
    validateField(field, val);
  };

  // Handle password submit with Yup schema validation
  const handleChangePassword = async () => {
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });
    dispatch(restoreChangePassword());

    try {
      await changePasswordYupSchema.validate(
        { currentPassword, newPassword, confirmPassword },
        { abortEarly: false }
      );

      setFieldErrors({});

      const result = await dispatch(
        changePasswordThunk({
          currentPassword,
          newPassword,
        })
      );

      if (changePasswordThunk.fulfilled.match(result)) {
        closePasswordModal();
        setSuccessModalMessage(
          'Your account password has been updated successfully. Please use your new password for your next login.'
        );
        setSuccessModalVisible(true);
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errorsMap: Record<string, string> = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path && !errorsMap[validationErr.path]) {
            errorsMap[validationErr.path] = validationErr.message;
          }
        });
        setFieldErrors(errorsMap);
      }
    }
  };

  const closePasswordModal = () => {
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setFieldErrors({});
    setTouched({});
    dispatch(restoreChangePassword());
  };

  const handleOpenSignOut = () => {
    setSignOutModalVisible(true);
  };

  const handleConfirmSignOut = async () => {
    setSignOutLoading(true);
    try {
      await dispatch(logoutThunk());
    } finally {
      setSignOutLoading(false);
      setSignOutModalVisible(false);
    }
  };

  const displayName = user?.fullName || roleInfo.avatar;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const userRolesDisplay = user?.roles && user.roles.length > 0
    ? user.roles.join(', ')
    : roleInfo.label;

  const hasCurrentError = Boolean(touched.currentPassword && fieldErrors.currentPassword);
  const isCurrentValid = Boolean(touched.currentPassword && !fieldErrors.currentPassword && currentPassword.length > 0);

  const hasNewError = Boolean(touched.newPassword && fieldErrors.newPassword);
  const isNewValid = Boolean(touched.newPassword && !fieldErrors.newPassword && newPassword.length >= 8);

  const hasConfirmError = Boolean(touched.confirmPassword && fieldErrors.confirmPassword);
  const isConfirmValid = Boolean(
    touched.confirmPassword &&
      !fieldErrors.confirmPassword &&
      confirmPassword.length >= 8 &&
      confirmPassword === newPassword
  );

  if (editProfileVisible) {
    return (
      <EditProfileScreen
        currentRole={currentRole}
        onBack={() => setEditProfileVisible(false)}
        onSuccess={() => {
          setEditProfileVisible(false);
        }}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Profile Header */}
      <Card style={styles.profileHeaderCard}>
        {/* Top-Right Edit Profile Icon Button (Placed in marked area) */}
        <TouchableOpacity
          style={[
            styles.topRightEditBtn,
            {
              backgroundColor: isDark ? '#2D1C12' : '#FFF5EB',
              borderColor: isDark ? '#5A2E14' : '#FED7AA',
            },
          ]}
          onPress={() => setEditProfileVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="edit-2" size={15} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleInfo.badgeColor }]}>
          <Text style={styles.roleBadgeText}>{userRolesDisplay}</Text>
        </View>
        <Text style={[styles.departmentText, { color: colors.textSecondary }]}>
          {user?.department || roleInfo.department} • Yenmin Smart Campus
        </Text>
      </Card>

      {/* Account Details */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
      <Card>
        {/* Full Name */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2D1C12' : Colors.primaryLight }]}>
              <Feather name="user" size={16} color={isDark ? colors.primary : Colors.primaryDark} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Full Name</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{displayName}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Email Address */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
              <Feather name="mail" size={16} color={isDark ? '#93C5FD' : '#1E40AF'} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Email Address</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {user?.email || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Direct Mobile */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
              <Feather name="phone" size={16} color={isDark ? '#6EE7B7' : '#065F46'} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Direct Mobile</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {user?.phone || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Department */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#4C1D95' : '#FDF4FF' }]}>
              <Feather name="briefcase" size={16} color={isDark ? '#C4B5FD' : '#86198F'} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Department</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {user?.department || roleInfo.department}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Appearance & Theme Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Theme</Text>
      <Card>
        <View style={styles.themeHeaderRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2D1C12' : '#FFF0DF' }]}>
              <Feather name={isDark ? 'moon' : 'sun'} size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Interface Theme</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {mode === 'system'
                  ? `System Default (${isDark ? 'Dark' : 'Light'})`
                  : mode === 'dark'
                  ? 'Dark Mode Active'
                  : 'Light Mode Active'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.themeSegmentContainer}>
          <TouchableOpacity
            style={[
              styles.themeSegmentBtn,
              {
                backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                borderColor: colors.border,
              },
              mode === 'light' && [
                styles.themeSegmentBtnActive,
                { borderColor: colors.primary, backgroundColor: isDark ? '#2D1C12' : '#FFF9F2' },
              ],
            ]}
            onPress={() => setThemeMode('light')}
            activeOpacity={0.7}
          >
            <Feather
              name="sun"
              size={15}
              color={mode === 'light' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.themeSegmentText,
                { color: colors.textSecondary },
                mode === 'light' && [styles.themeSegmentTextActive, { color: colors.primary }],
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeSegmentBtn,
              {
                backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                borderColor: colors.border,
              },
              mode === 'dark' && [
                styles.themeSegmentBtnActive,
                { borderColor: colors.primary, backgroundColor: isDark ? '#2D1C12' : '#FFF9F2' },
              ],
            ]}
            onPress={() => setThemeMode('dark')}
            activeOpacity={0.7}
          >
            <Feather
              name="moon"
              size={15}
              color={mode === 'dark' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.themeSegmentText,
                { color: colors.textSecondary },
                mode === 'dark' && [styles.themeSegmentTextActive, { color: colors.primary }],
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeSegmentBtn,
              {
                backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                borderColor: colors.border,
              },
              mode === 'system' && [
                styles.themeSegmentBtnActive,
                { borderColor: colors.primary, backgroundColor: isDark ? '#2D1C12' : '#FFF9F2' },
              ],
            ]}
            onPress={() => setThemeMode('system')}
            activeOpacity={0.7}
          >
            <Feather
              name="smartphone"
              size={15}
              color={mode === 'system' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.themeSegmentText,
                { color: colors.textSecondary },
                mode === 'system' && [styles.themeSegmentTextActive, { color: colors.primary }],
              ]}
            >
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Security & Credentials */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Security & Credentials</Text>
      <Card>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setPasswordModalVisible(true)}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#3D2A10' : '#FFFBEB' }]}>
              <Feather name="lock" size={16} color={isDark ? '#FCD34D' : '#92400E'} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Change Password</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>Update your secure login password</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      {/* Sign Out Button */}
      <Button
        title="Log out"
        variant="outline"
        icon="log-out"
        onPress={handleOpenSignOut}
        style={{ marginTop: 14, borderColor: isDark ? '#7F1D1D' : '#FECACA' }}
      />

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closePasswordModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalHeaderIcon,
                  { backgroundColor: isDark ? '#2D1C12' : colors.primaryLight },
                ]}
              >
                <Feather name="shield" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Update your account login password
                </Text>
              </View>
              <TouchableOpacity
                onPress={closePasswordModal}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' },
                ]}
              >
                <Feather name="x" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {changePasswordError && (
              <View style={styles.modalErrorBanner}>
                <Feather name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.modalErrorText}>{changePasswordError}</Text>
              </View>
            )}

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Current Password Field */}
              <View style={styles.modalInputGroup}>
                <View style={styles.modalLabelRow}>
                  <Text style={[styles.modalLabel, { color: colors.text }]}>Current Password</Text>
                </View>
                <View
                  style={[
                    styles.modalInputWrapper,
                    {
                      backgroundColor: isDark
                        ? (hasCurrentError ? '#2D1418' : (isCurrentValid ? '#062B1D' : '#0B0F19'))
                        : (hasCurrentError ? '#FEF2F2' : (isCurrentValid ? '#F0FDF4' : '#F8FAFC')),
                      borderColor: hasCurrentError
                        ? '#EF4444'
                        : (isCurrentValid ? '#10B981' : colors.border),
                    },
                  ]}
                >
                  <Feather
                    name="lock"
                    size={16}
                    color={hasCurrentError ? '#EF4444' : (isCurrentValid ? '#10B981' : colors.textMuted)}
                    style={styles.modalInputIcon}
                  />
                  <TextInput
                    style={[styles.modalTextInput, { color: colors.text }]}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={handleCurrentPasswordChange}
                    onBlur={() => handleBlur('currentPassword')}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.modalEyeBtn}
                  >
                    <Feather
                      name={showCurrentPassword ? 'eye-off' : 'eye'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {hasCurrentError && (
                  <View style={styles.modalFieldErrorRow}>
                    <Feather name="alert-circle" size={12} color="#DC2626" />
                    <Text style={styles.modalFieldErrorText}>{fieldErrors.currentPassword}</Text>
                  </View>
                )}
              </View>

              {/* New Password Field */}
              <View style={styles.modalInputGroup}>
                <View style={styles.modalLabelRow}>
                  <Text style={[styles.modalLabel, { color: colors.text }]}>
                    New Password (min 8 chars)
                  </Text>
                </View>
                <View
                  style={[
                    styles.modalInputWrapper,
                    {
                      backgroundColor: isDark
                        ? (hasNewError ? '#2D1418' : (isNewValid ? '#062B1D' : '#0B0F19'))
                        : (hasNewError ? '#FEF2F2' : (isNewValid ? '#F0FDF4' : '#F8FAFC')),
                      borderColor: hasNewError
                        ? '#EF4444'
                        : (isNewValid ? '#10B981' : colors.border),
                    },
                  ]}
                >
                  <Feather
                    name="lock"
                    size={16}
                    color={hasNewError ? '#EF4444' : (isNewValid ? '#10B981' : colors.textMuted)}
                    style={styles.modalInputIcon}
                  />
                  <TextInput
                    style={[styles.modalTextInput, { color: colors.text }]}
                    placeholder="Enter at least 8 characters"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                    onBlur={() => handleBlur('newPassword')}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.modalEyeBtn}
                  >
                    <Feather
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {hasNewError && (
                  <View style={styles.modalFieldErrorRow}>
                    <Feather name="alert-circle" size={12} color="#DC2626" />
                    <Text style={styles.modalFieldErrorText}>{fieldErrors.newPassword}</Text>
                  </View>
                )}
              </View>

              {/* Confirm New Password Field */}
              <View style={styles.modalInputGroup}>
                <View style={styles.modalLabelRow}>
                  <Text style={[styles.modalLabel, { color: colors.text }]}>Confirm New Password</Text>
                </View>
                <View
                  style={[
                    styles.modalInputWrapper,
                    {
                      backgroundColor: isDark
                        ? (hasConfirmError ? '#2D1418' : (isConfirmValid ? '#062B1D' : '#0B0F19'))
                        : (hasConfirmError ? '#FEF2F2' : (isConfirmValid ? '#F0FDF4' : '#F8FAFC')),
                      borderColor: hasConfirmError
                        ? '#EF4444'
                        : (isConfirmValid ? '#10B981' : colors.border),
                    },
                  ]}
                >
                  <Feather
                    name="lock"
                    size={16}
                    color={hasConfirmError ? '#EF4444' : (isConfirmValid ? '#10B981' : colors.textMuted)}
                    style={styles.modalInputIcon}
                  />
                  <TextInput
                    style={[styles.modalTextInput, { color: colors.text }]}
                    placeholder="Re-enter new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.modalEyeBtn}
                  >
                    <Feather
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {hasConfirmError && (
                  <View style={styles.modalFieldErrorRow}>
                    <Feather name="alert-circle" size={12} color="#DC2626" />
                    <Text style={styles.modalFieldErrorText}>{fieldErrors.confirmPassword}</Text>
                  </View>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: isDark ? '#1E293B' : 'transparent',
                    },
                  ]}
                  onPress={closePasswordModal}
                  disabled={changePasswordLoading}
                >
                  <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSubmitBtn,
                    { backgroundColor: colors.primary },
                    changePasswordLoading && { opacity: 0.7 },
                  ]}
                  onPress={handleChangePassword}
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.modalSubmitText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modern Log Out Confirmation Modal */}
      <ConfirmationModal
        visible={signOutModalVisible}
        type="danger"
        title="Log out"
        message="Are you sure you want to log out of Yenmin Smart Campus FMS?"
        confirmText="Log out"
        cancelText="Cancel"
        confirmIcon="log-out"
        loading={signOutLoading}
        onCancel={() => setSignOutModalVisible(false)}
        onConfirm={handleConfirmSignOut}
        userPreview={{
          name: displayName,
          subtitle: user?.email || roleInfo.label,
          initials,
        }}
      />

      {/* Modern Success Modal for Password Change */}
      <ConfirmationModal
        visible={successModalVisible}
        type="success"
        title="Password Updated"
        message={successModalMessage}
        confirmText="Done"
        confirmIcon="check"
        showCancel={false}
        onCancel={() => setSuccessModalVisible(false)}
        onConfirm={() => setSuccessModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  topRightEditBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 6,
    marginBottom: 4,
  },
  roleBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  departmentText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  settingValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalErrorText: {
    fontSize: 11,
    color: '#991B1B',
    flex: 1,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  validPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  validPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48,
  },
  modalInputWrapperError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  modalInputWrapperSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  modalInputIcon: {
    marginRight: 10,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    height: '100%',
  },
  modalEyeBtn: {
    padding: 6,
  },
  modalFieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 2,
  },
  modalFieldErrorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: '#F8FAFC',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  themeHeaderRow: {
    paddingVertical: 2,
    marginBottom: 12,
  },
  themeSegmentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeSegmentBtnActive: {
    borderWidth: 1.5,
  },
  themeSegmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeSegmentTextActive: {
    fontWeight: '800',
  },
});
