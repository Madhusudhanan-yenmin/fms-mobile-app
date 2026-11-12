import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
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
  updateProfileThunk,
  getProfileThunk,
  restoreProfileDetail,
} from '../../store';
import { editProfileYupSchema } from '../../helpers/validation.helper';

export interface EditProfileScreenProps {
  currentRole: AppRole;
  onBack: () => void;
  onSuccess?: () => void;
}

const DEPARTMENT_OPTIONS = [
  'Facility Management',
  'Electrical & Maintenance',
  'Housekeeping & Hygiene',
  'IT & Information Systems',
  'Academic Faculty',
  'Administration & Finances',
  'Central Stores & Logistics',
  'Safety & Security',
  'Mechanical & HVAC',
  'Academic Laboratories',
  'Campus Leadership & Management',
  'Civil & Infrastructure',
  'Hostel & Residential Services',
  'Transport & Fleet Management',
];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  currentRole,
  onBack,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const user = useAppSelector((state) => state.login.user);
  const { loading: updateLoading, error: updateError } = useAppSelector(
    (state) => state.profile
  );

  const roleInfo = APP_ROLES[currentRole] || APP_ROLES['technician'];

  // Form Fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(
    user?.department || roleInfo.department || ''
  );

  // Department Dropdown State
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState('');

  // Field validation and touched states
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    department?: string;
  }>({});
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    phone?: boolean;
    department?: boolean;
  }>({});

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Departments List with search filter
  const allDepartments = React.useMemo(() => {
    const list = [...DEPARTMENT_OPTIONS];
    if (
      department &&
      !list.some((d) => d.toLowerCase() === department.trim().toLowerCase())
    ) {
      list.unshift(department.trim());
    }
    return list;
  }, [department]);

  const filteredDepartments = React.useMemo(() => {
    if (!deptSearchQuery.trim()) return allDepartments;
    const q = deptSearchQuery.trim().toLowerCase();
    return allDepartments.filter((d) => d.toLowerCase().includes(q));
  }, [allDepartments, deptSearchQuery]);

  // Sync initial values if user changes
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
      if (user.department) setDepartment(user.department);
    }
  }, [user]);

  // Clean up error on unmount or reset
  useEffect(() => {
    dispatch(restoreProfileDetail());
  }, [dispatch]);

  // Handle hardware back on Android
  useEffect(() => {
    const onHardwareBack = () => {
      onBack();
      return true;
    };

    const backSub = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBack
    );

    return () => {
      backSub.remove();
    };
  }, [onBack]);

  // Live Field Validation
  const validateField = async (
    field: 'fullName' | 'phone' | 'department',
    val: string
  ) => {
    try {
      const data = {
        fullName: field === 'fullName' ? val : fullName,
        phone: field === 'phone' ? val : phone,
        department: field === 'department' ? val : department,
      };

      await editProfileYupSchema.validateAt(field, data);

      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
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

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (updateError) dispatch(restoreProfileDetail());
    if (touched.fullName || val.length > 0) {
      validateField('fullName', val);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (updateError) dispatch(restoreProfileDetail());
    if (touched.phone || val.length > 0) {
      validateField('phone', val);
    }
  };

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    if (updateError) dispatch(restoreProfileDetail());
    if (touched.department || val.length > 0) {
      validateField('department', val);
    }
  };

  const handleBlur = (field: 'fullName' | 'phone' | 'department') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === 'fullName' ? fullName : field === 'phone' ? phone : department;
    validateField(field, val);
  };

  const handleSubmit = async () => {
    setTouched({
      fullName: true,
      phone: true,
      department: true,
    });
    dispatch(restoreProfileDetail());

    try {
      await editProfileYupSchema.validate(
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          department: department.trim(),
        },
        { abortEarly: false }
      );

      setFieldErrors({});

      const result = await dispatch(
        updateProfileThunk({
          fullName: fullName.trim(),
          phone: phone.trim() ? phone.trim() : undefined,
          department: department.trim() ? department.trim() : undefined,
        })
      );

      if (updateProfileThunk.fulfilled.match(result)) {
        await dispatch(getProfileThunk());
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

  const handleSuccessDone = () => {
    setSuccessModalVisible(false);
    if (onSuccess) {
      onSuccess();
    } else {
      onBack();
    }
  };

  const displayName = fullName || user?.fullName || roleInfo.avatar;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const userRolesDisplay =
    user?.roles && user.roles.length > 0
      ? user.roles.join(', ')
      : roleInfo.label;

  const hasNameError = Boolean(touched.fullName && fieldErrors.fullName);
  const isNameValid = Boolean(
    touched.fullName && !fieldErrors.fullName && fullName.trim().length >= 2
  );

  const hasPhoneError = Boolean(touched.phone && fieldErrors.phone);
  const isPhoneValid = Boolean(
    touched.phone &&
      !fieldErrors.phone &&
      phone.trim().length > 0 &&
      /^(\+?[1-9]\d{0,3}[- ]?)?\d{7,12}$/.test(phone.trim())
  );

  const hasDeptError = Boolean(touched.department && fieldErrors.department);
  const isDeptValid = Boolean(
    touched.department &&
      !fieldErrors.department &&
      department.trim().length > 0
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <View style={styles.backIconCircle}>
              <Feather name="arrow-left" size={16} color={colors.text} />
            </View>
            <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>
              Back to Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Screen Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>{initials || 'U'}</Text>
            </View>
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="user-check" size={13} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Edit Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Update your personal profile and campus contact information
          </Text>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: roleInfo.badgeColor },
            ]}
          >
            <Text style={styles.roleBadgeText}>{userRolesDisplay}</Text>
          </View>
        </Card>

        {/* Server Error Banner */}
        {updateError && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorBannerText}>{updateError}</Text>
          </View>
        )}

        {/* Personal Details Card */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Personal Information
        </Text>
        <Card>
          {/* Full Name Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              {isNameValid && (
                <View style={styles.validPill}>
                  <Feather name="check" size={12} color="#059669" />
                  <Text style={styles.validPillText}>Valid</Text>
                </View>
              )}
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark
                    ? hasNameError
                      ? '#2D1418'
                      : isNameValid
                      ? '#062B1D'
                      : '#0B0F19'
                    : hasNameError
                    ? '#FEF2F2'
                    : isNameValid
                    ? '#F0FDF4'
                    : '#F9FBFD',
                  borderColor: hasNameError
                    ? '#EF4444'
                    : isNameValid
                    ? '#10B981'
                    : colors.border,
                },
              ]}
            >
              <Feather
                name="user"
                size={18}
                color={
                  hasNameError
                    ? '#EF4444'
                    : isNameValid
                    ? '#10B981'
                    : colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={handleFullNameChange}
                onBlur={() => handleBlur('fullName')}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {hasNameError && (
              <View style={styles.fieldErrorRow}>
                <Feather name="alert-circle" size={12} color="#DC2626" />
                <Text style={styles.fieldErrorText}>
                  {fieldErrors.fullName}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.borderLight }]}
          />

          {/* Email Field (Read Only) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                Institutional Email
              </Text>
              <View style={styles.readOnlyBadge}>
                <Feather name="lock" size={11} color={colors.textMuted} />
                <Text
                  style={[
                    styles.readOnlyBadgeText,
                    { color: colors.textMuted },
                  ]}
                >
                  Read Only
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.inputWrapper,
                styles.readOnlyInputWrapper,
                {
                  backgroundColor: isDark ? '#151C2C' : '#F1F5F9',
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather
                name="mail"
                size={18}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.textSecondary },
                ]}
                value={user?.email || 'Not provided'}
                editable={false}
              />
              <Feather name="lock" size={16} color={colors.textMuted} />
            </View>
            <Text
              style={[
                styles.inputHelpText,
                { color: colors.textSecondary },
              ]}
            >
              Institutional email address is assigned by campus administration.
            </Text>
          </View>
        </Card>

        {/* Contact & Campus Department Card */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Campus Contact & Department
        </Text>
        <Card>
          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                Direct Mobile Phone
              </Text>
              {isPhoneValid && (
                <View style={styles.validPill}>
                  <Feather name="check" size={12} color="#059669" />
                  <Text style={styles.validPillText}>Valid</Text>
                </View>
              )}
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark
                    ? hasPhoneError
                      ? '#2D1418'
                      : isPhoneValid
                      ? '#062B1D'
                      : '#0B0F19'
                    : hasPhoneError
                    ? '#FEF2F2'
                    : isPhoneValid
                    ? '#F0FDF4'
                    : '#F9FBFD',
                  borderColor: hasPhoneError
                    ? '#EF4444'
                    : isPhoneValid
                    ? '#10B981'
                    : colors.border,
                },
              ]}
            >
              <Feather
                name="phone"
                size={18}
                color={
                  hasPhoneError
                    ? '#EF4444'
                    : isPhoneValid
                    ? '#10B981'
                    : colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="+919876543210"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={handlePhoneChange}
                onBlur={() => handleBlur('phone')}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
            {hasPhoneError && (
              <View style={styles.fieldErrorRow}>
                <Feather name="alert-circle" size={12} color="#DC2626" />
                <Text style={styles.fieldErrorText}>{fieldErrors.phone}</Text>
              </View>
            )}
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.borderLight }]}
          />

          {/* Department Select Dropdown Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                Department
              </Text>
              {isDeptValid && (
                <View style={styles.validPill}>
                  <Feather name="check" size={12} color="#059669" />
                  <Text style={styles.validPillText}>Selected</Text>
                </View>
              )}
            </View>

            {/* Dropdown Select Trigger Box */}
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                styles.dropdownTrigger,
                {
                  backgroundColor: isDark
                    ? hasDeptError
                      ? '#2D1418'
                      : isDeptValid
                      ? '#062B1D'
                      : '#0B0F19'
                    : hasDeptError
                    ? '#FEF2F2'
                    : isDeptValid
                    ? '#F0FDF4'
                    : '#F9FBFD',
                  borderColor: deptDropdownOpen
                    ? colors.primary
                    : hasDeptError
                    ? '#EF4444'
                    : isDeptValid
                    ? '#10B981'
                    : colors.border,
                  borderWidth: deptDropdownOpen ? 2 : 1.5,
                },
              ]}
              onPress={() => {
                setDeptDropdownOpen(!deptDropdownOpen);
                if (!touched.department) {
                  setTouched((prev) => ({ ...prev, department: true }));
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownTriggerLeft}>
                <Feather
                  name="briefcase"
                  size={18}
                  color={
                    hasDeptError
                      ? '#EF4444'
                      : isDeptValid
                      ? '#10B981'
                      : colors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.dropdownSelectedText,
                    {
                      color: department ? colors.text : colors.textMuted,
                      fontWeight: department ? '600' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {department || 'Select Department'}
                </Text>
              </View>
              <Feather
                name={deptDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={deptDropdownOpen ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>

            {hasDeptError && (
              <View style={styles.fieldErrorRow}>
                <Feather name="alert-circle" size={12} color="#DC2626" />
                <Text style={styles.fieldErrorText}>
                  {fieldErrors.department}
                </Text>
              </View>
            )}

            {/* Dropdown Options Menu */}
            {deptDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: isDark ? '#151C2C' : colors.surface,
                    borderColor: isDark ? '#27354A' : colors.border,
                  },
                ]}
              >
                {/* Search / Filter box */}
                <View
                  style={[
                    styles.dropdownSearchWrapper,
                    {
                      backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                      borderColor: isDark ? '#27354A' : colors.borderLight,
                    },
                  ]}
                >
                  <Feather name="search" size={14} color={colors.textMuted} />
                  <TextInput
                    style={[styles.dropdownSearchInput, { color: colors.text }]}
                    placeholder="Search department..."
                    placeholderTextColor={colors.textMuted}
                    value={deptSearchQuery}
                    onChangeText={setDeptSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {deptSearchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setDeptSearchQuery('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="x" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Scrollable list of departments */}
                <ScrollView
                  nestedScrollEnabled={true}
                  style={styles.dropdownScrollView}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {filteredDepartments.length === 0 ? (
                    <View style={styles.emptySearchRow}>
                      <Text
                        style={[
                          styles.emptySearchText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        No matching departments found
                      </Text>
                    </View>
                  ) : (
                    filteredDepartments.map((deptName, idx) => {
                      const isSelected =
                        department.trim().toLowerCase() ===
                        deptName.trim().toLowerCase();
                      return (
                        <TouchableOpacity
                          key={deptName}
                          style={[
                            styles.dropdownOption,
                            {
                              borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
                              backgroundColor: isSelected
                                ? isDark
                                  ? '#2D1C12'
                                  : '#FFF9F2'
                                : 'transparent',
                            },
                            idx === filteredDepartments.length - 1 && {
                              borderBottomWidth: 0,
                            },
                          ]}
                          onPress={() => {
                            handleDepartmentChange(deptName);
                            setDeptDropdownOpen(false);
                            setDeptSearchQuery('');
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownOptionLeft}>
                            <View
                              style={[
                                styles.dropdownDot,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary
                                    : isDark
                                    ? '#374151'
                                    : '#CBD5E1',
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                {
                                  color: isSelected
                                    ? colors.primary
                                    : colors.text,
                                  fontWeight: isSelected ? '700' : '500',
                                },
                              ]}
                            >
                              {deptName}
                            </Text>
                          </View>
                          {isSelected && (
                            <Feather
                              name="check-circle"
                              size={16}
                              color={colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              updateLoading && styles.btnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={updateLoading}
            activeOpacity={0.8}
          >
            {updateLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.primaryBtnText}>
                  Save Profile Changes
                </Text>
                <Feather name="check" size={16} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>

          <Button
            title="Cancel & Discard"
            variant="outline"
            icon="x"
            onPress={onBack}
            disabled={updateLoading}
            style={{ marginTop: 10 }}
          />
        </View>

        {/* Modern Success Confirmation Modal */}
        <ConfirmationModal
          visible={successModalVisible}
          type="success"
          title="Profile Updated"
          message="Your profile information has been successfully updated and synced across Yenmin Smart Campus FMS."
          confirmText="Done"
          confirmIcon="check"
          showCancel={false}
          onCancel={handleSuccessDone}
          onConfirm={handleSuccessDone}
          userPreview={{
            name: displayName,
            subtitle: department || user?.email || roleInfo.label,
            initials,
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  navBar: {
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  backIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    lineHeight: 17,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '700',
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
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  readOnlyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  readOnlyInputWrapper: {
    opacity: 0.85,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  inputHelpText: {
    fontSize: 10.5,
    marginTop: 4,
    marginLeft: 2,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 2,
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  dropdownTrigger: {
    justifyContent: 'space-between',
  },
  dropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownSelectedText: {
    fontSize: 13,
    flex: 1,
  },
  dropdownMenu: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 6,
    gap: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 12,
    height: '100%',
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  dropdownOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dropdownOptionText: {
    fontSize: 12.5,
  },
  emptySearchRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 12,
  },
  actionButtonsContainer: {
    marginTop: 14,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});

