import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { Colors } from '../../constants/colors';
import { useAppDispatch, useAppSelector, clearAuthError, loginThunk } from '../../store';
import { loginYupSchema } from '../../helpers/validation.helper';
import { useTheme } from '../../context';

interface LoginScreenProps {
  onNavigateToForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToForgotPassword }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);
  const { isLoading, error: backendError } = useAppSelector((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Field-level error messages
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  // Track whether the user has interacted with the field
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Listen for keyboard events to adjust layout dynamically
  useEffect(() => {
    const handleKeyboardShow = (e: any) => {
      const height = e?.endCoordinates?.height || 320;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );
    const didShowSub = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const didHideSub = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
      didShowSub.remove();
      didHideSub.remove();
    };
  }, []);

  // Live validation for a specific field
  const validateField = async (field: 'email' | 'password', value: string) => {
    try {
      await loginYupSchema.validateAt(field, {
        email: field === 'email' ? value : email,
        password: field === 'password' ? value : password,
      });
      // Clear error for this field if valid
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

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (backendError) dispatch(clearAuthError());
    if (touched.email || val.length > 0) {
      validateField('email', val);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (backendError) dispatch(clearAuthError());
    if (touched.password || val.length > 0) {
      validateField('password', val);
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'email' ? email : password;
    validateField(field, val);
  };

  const handleEmailFocus = () => {
    setIsKeyboardVisible(true);
    if (!keyboardHeight) setKeyboardHeight(320);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 150);
  };

  const handlePasswordFocus = () => {
    setIsKeyboardVisible(true);
    if (!keyboardHeight) setKeyboardHeight(320);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 180);
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    dispatch(clearAuthError());

    try {
      // Validate full form with Yup schema
      await loginYupSchema.validate(
        { email: email.trim(), password },
        { abortEarly: false }
      );

      // Form is 100% valid -> dispatch login API
      setFieldErrors({});
      dispatch(
        loginThunk({
          email: email.trim(),
          password,
        })
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errorsMap: { email?: string; password?: string } = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path && !errorsMap[validationErr.path as 'email' | 'password']) {
            errorsMap[validationErr.path as 'email' | 'password'] = validationErr.message;
          }
        });
        setFieldErrors(errorsMap);
      }
    }
  };

  const hasEmailError = Boolean(touched.email && fieldErrors.email);
  const hasPasswordError = Boolean(touched.password && fieldErrors.password);

  const activeBottomInset = keyboardHeight > 0 ? keyboardHeight : (isKeyboardVisible ? 320 : 0);

  return (
    <View
      style={[
        styles.keyboardContainer,
        {
          paddingBottom: activeBottomInset,
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !isKeyboardVisible && styles.scrollContentCentered,
          {
            paddingTop: Math.max(insets.top, 24) + (isKeyboardVisible ? 10 : 20),
            paddingBottom: isKeyboardVisible ? 24 : Math.max(insets.bottom, 24) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        <View>
          {/* Branding Header */}
          <View style={[styles.brandContainer, isKeyboardVisible && styles.brandContainerCompact]}>
            <View style={[styles.logoBadge, isKeyboardVisible && styles.logoBadgeCompact]}>
              <Feather name="zap" size={isKeyboardVisible ? 22 : 28} color={Colors.white} />
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Smart Campus FMS</Text>
            <Text
              style={[
                styles.brandSubtitle,
                { color: isDark ? colors.primary : Colors.primaryDark },
              ]}
            >
              Yenmin Communications
            </Text>
          </View>

          {/* Welcome Form Card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Sign In</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Enter your campus credentials to access facility operations & maintenance.
            </Text>

            {/* Backend Error Alert Banner */}
            {backendError && (
              <View style={styles.backendErrorBanner}>
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.backendErrorText} numberOfLines={3}>
                  {backendError}
                </Text>
                <TouchableOpacity onPress={() => dispatch(clearAuthError())}>
                  <Feather name="x" size={14} color="#991B1B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Email Input with Live Yup Validation */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
                {touched.email && !fieldErrors.email && email.length > 0 && (
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
                      ? (hasEmailError ? '#2D1418' : (touched.email && !fieldErrors.email && email.length > 0 ? '#062B1D' : '#0B0F19'))
                      : (hasEmailError ? '#FEF2F2' : (touched.email && !fieldErrors.email && email.length > 0 ? '#F0FDF4' : '#F9FBFD')),
                    borderColor: hasEmailError
                      ? '#EF4444'
                      : (touched.email && !fieldErrors.email && email.length > 0 ? '#10B981' : colors.border),
                  },
                ]}
              >
                <Feather
                  name="mail"
                  size={18}
                  color={
                    hasEmailError
                      ? '#EF4444'
                      : (touched.email && !fieldErrors.email && email.length > 0 ? '#10B981' : colors.textMuted)
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="name@smartcampus.edu"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={() => handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {hasEmailError && (
                <View style={styles.fieldErrorRow}>
                  <Feather name="alert-circle" size={12} color="#DC2626" />
                  <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                </View>
              )}
            </View>

            {/* Password Input with Live Yup Validation */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                {onNavigateToForgotPassword && (
                  <TouchableOpacity onPress={onNavigateToForgotPassword} activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark
                      ? (hasPasswordError ? '#2D1418' : (touched.password && !fieldErrors.password && password.length >= 8 ? '#062B1D' : '#0B0F19'))
                      : (hasPasswordError ? '#FEF2F2' : (touched.password && !fieldErrors.password && password.length >= 8 ? '#F0FDF4' : '#F9FBFD')),
                    borderColor: hasPasswordError
                      ? '#EF4444'
                      : (touched.password && !fieldErrors.password && password.length >= 8 ? '#10B981' : colors.border),
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color={
                    hasPasswordError
                      ? '#EF4444'
                      : (touched.password && !fieldErrors.password && password.length >= 8 ? '#10B981' : colors.textMuted)
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onFocus={handlePasswordFocus}
                  onBlur={() => handleBlur('password')}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {hasPasswordError && (
                <View style={styles.fieldErrorRow}>
                  <Feather name="alert-circle" size={12} color="#DC2626" />
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                </View>
              )}
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, isLoading && styles.signInBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.signInBtnText}>Sign In to Campus FMS</Text>
                  <Feather name="arrow-right" size={16} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  scrollContentCentered: {
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandContainerCompact: {
    marginBottom: 12,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 10,
  },
  logoBadgeCompact: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  backendErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  backendErrorText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  forgotPasswordLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  validPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputWrapperSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingLeft: 4,
  },
  fieldErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signInBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
