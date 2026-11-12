import React, { useState, useEffect, useRef } from 'react';
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
  BackHandler,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { Colors } from '../../constants/colors';
import {
  useAppDispatch,
  useAppSelector,
  forgotPasswordThunk,
  resetPasswordThunk,
  restoreForgotPassword,
  restoreResetPassword,
} from '../../store';
import {
  forgotPasswordYupSchema,
  resetPasswordYupSchema,
} from '../../helpers/validation.helper';
import { useTheme } from '../../context';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onResetSuccess?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToLogin,
  onResetSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<any>(null);
  const otpInputRef = useRef<any>(null);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const { loading: forgotLoading, error: forgotError } = useAppSelector(
    (state) => state.forgotPassword
  );
  const { loading: resetLoading, error: resetError } = useAppSelector(
    (state) => state.resetPassword
  );

  // Step 1: Request OTP | Step 2: Verify OTP & New Password | Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Auto-focus OTP input when advancing to Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputRef.current?.focus(), 350);
    }
  }, [step]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Layout measurements
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Field-level Errors & Touched
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    otp?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  useEffect(() => {
    dispatch(restoreForgotPassword());
    dispatch(restoreResetPassword());

    const handleKeyboardShow = (e: any) => {
      const height = e?.endCoordinates?.height || 340;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
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
  }, [dispatch]);

  // Helper to completely clear all Step 2 fields and state
  const resetResetPasswordFields = () => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsOtpFocused(false);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.otp;
      delete next.newPassword;
      delete next.confirmPassword;
      return next;
    });
    setTouched((prev) => {
      const next = { ...prev };
      delete next.otp;
      delete next.newPassword;
      delete next.confirmPassword;
      return next;
    });
    dispatch(restoreResetPassword());
  };

  const handleBackToLogin = () => {
    resetResetPasswordFields();
    dispatch(restoreForgotPassword());
    onBackToLogin();
  };

  const handleChangeEmail = () => {
    resetResetPasswordFields();
    setStep(1);
  };

  // Hardware Back Button listener on Android
  useEffect(() => {
    const onHardwareBack = () => {
      if (step === 2) {
        handleChangeEmail();
        return true;
      }
      if (step === 3) {
        if (onResetSuccess) onResetSuccess();
        else handleBackToLogin();
        return true;
      }
      handleBackToLogin();
      return true;
    };

    const backHandlerSub = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBack
    );

    return () => {
      backHandlerSub.remove();
    };
  }, [step, onResetSuccess]);

  // Whenever returning to Step 1, wipe Step 2 fields clean
  useEffect(() => {
    if (step === 1) {
      resetResetPasswordFields();
    }
  }, [step]);

  const scrollToInput = (yOffset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
    }, 120);
  };

  // Live Field Validation for Step 1
  const validateEmailField = async (val: string) => {
    try {
      await forgotPasswordYupSchema.validateAt('email', { email: val });
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors((prev) => ({ ...prev, email: err.message }));
      }
    }
  };

  // Live Field Validation for Step 2
  const validateStep2Field = async (
    field: 'otp' | 'newPassword' | 'confirmPassword',
    val: string
  ) => {
    try {
      const data = {
        otp: field === 'otp' ? val : otp,
        newPassword: field === 'newPassword' ? val : newPassword,
        confirmPassword: field === 'confirmPassword' ? val : confirmPassword,
      };
      await resetPasswordYupSchema.validateAt(field, data);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [field]: err.message }));
      }
    }
  };

  // Handle Step 1: Send OTP
  const handleRequestOtp = async () => {
    setTouched((prev) => ({ ...prev, email: true }));

    try {
      await forgotPasswordYupSchema.validate({ email: email.trim() }, { abortEarly: false });
      setFieldErrors({});

      const result = await dispatch(forgotPasswordThunk({ email: email.trim() }));
      if (forgotPasswordThunk.fulfilled.match(result)) {
        resetResetPasswordFields();
        setStep(2);
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors({ email: err.inner[0]?.message });
        scrollToInput(60);
      }
    }
  };

  // Handle Step 2: Reset Password
  const handleResetPassword = async () => {
    setTouched({ otp: true, newPassword: true, confirmPassword: true });

    try {
      await resetPasswordYupSchema.validate(
        { otp: otp.trim(), newPassword, confirmPassword },
        { abortEarly: false }
      );
      setFieldErrors({});

      const result = await dispatch(
        resetPasswordThunk({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        })
      );

      if (resetPasswordThunk.fulfilled.match(result)) {
        resetResetPasswordFields();
        setStep(3);
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
        scrollToInput(100);
      }
    }
  };

  const activeBottomInset = keyboardHeight > 0 ? keyboardHeight : (isKeyboardVisible ? 320 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1, paddingBottom: activeBottomInset }}>
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
          <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
            {/* Branding Icon (Steps 1 & 2) */}
            {step !== 3 && (
              <View style={[styles.brandIconWrapper, isKeyboardVisible && styles.brandIconWrapperCompact]}>
                <View style={[styles.iconCircle, isKeyboardVisible && styles.iconCircleCompact]}>
                  <Feather
                    name="lock"
                    size={isKeyboardVisible ? 22 : 28}
                    color={Colors.white}
                  />
                </View>
              </View>
            )}

            {/* ================= STEP 1: ENTER EMAIL ================= */}
            {step === 1 && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Enter your registered institutional email. We will send you a 6-digit verification code to reset your password.
                </Text>

                {/* Error Banner */}
                {forgotError && (
                  <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorBannerText}>{forgotError}</Text>
                  </View>
                )}

                {/* Email Field with Live Yup Validation */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>Registered Email</Text>
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark
                          ? (touched.email && fieldErrors.email ? '#2D1418' : (touched.email && !fieldErrors.email && email.length > 0 ? '#062B1D' : '#0B0F19'))
                          : (touched.email && fieldErrors.email ? '#FEF2F2' : (touched.email && !fieldErrors.email && email.length > 0 ? '#F0FDF4' : '#F9FBFD')),
                        borderColor: touched.email && fieldErrors.email
                          ? '#EF4444'
                          : (touched.email && !fieldErrors.email && email.length > 0 ? '#10B981' : colors.border),
                      },
                    ]}
                  >
                    <Feather
                      name="mail"
                      size={18}
                      color={
                        touched.email && fieldErrors.email
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
                      onChangeText={(val) => {
                        setEmail(val);
                        if (touched.email || val.length > 0) validateEmailField(val);
                      }}
                      onFocus={() => {
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, email: true }));
                        validateEmailField(email);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {touched.email && fieldErrors.email && (
                    <View style={styles.fieldErrorRow}>
                      <Feather name="alert-circle" size={12} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, forgotLoading && styles.btnDisabled]}
                  onPress={handleRequestOtp}
                  disabled={forgotLoading}
                  activeOpacity={0.8}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <View style={styles.btnInner}>
                      <Text style={styles.primaryBtnText}>Send 6-Digit Code</Text>
                      <Feather name="send" size={16} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.returnToLoginBtn}
                  onPress={handleBackToLogin}
                  activeOpacity={0.7}
                >
                  <Text style={styles.returnToLoginText}>
                    Remember your password? <Text style={styles.boldOrange}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2: VERIFY OTP & RESET PASSWORD ================= */}
            {step === 2 && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  A 6-digit OTP code was sent to{' '}
                  <Text style={{ fontWeight: '700', color: colors.text }}>{email}</Text>. Enter the
                  code and your new password.
                </Text>

                {/* Error Banner */}
                {resetError && (
                  <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorBannerText}>{resetError}</Text>
                  </View>
                )}

                {/* 6-Digit Individual Number Boxes OTP Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>6-Digit Verification Code</Text>
                    {touched.otp && !fieldErrors.otp && otp.length === 6 && (
                      <View style={styles.validPill}>
                        <Feather name="check" size={12} color="#059669" />
                        <Text style={styles.validPillText}>Ready</Text>
                      </View>
                    )}
                  </View>

                  {/* 6 Individual Number Boxes Container */}
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => otpInputRef.current?.focus()}
                    style={styles.otpBoxesRow}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const digit = otp[index] || '';
                      const isCurrent =
                        isOtpFocused &&
                        (index === otp.length || (index === 5 && otp.length === 6));
                      const isError = Boolean(touched.otp && fieldErrors.otp);
                      const isSuccess = Boolean(
                        touched.otp && !fieldErrors.otp && otp.length === 6
                      );

                      let borderColor = colors.border;
                      let backgroundColor = isDark ? '#151C2C' : colors.surface;

                      if (isError) {
                        borderColor = '#DC2626';
                        backgroundColor = isDark ? '#2D1418' : '#FEF2F2';
                      } else if (isSuccess) {
                        borderColor = '#10B981';
                        backgroundColor = isDark ? '#064E3B' : '#ECFDF5';
                      } else if (isCurrent) {
                        borderColor = colors.primary;
                        backgroundColor = isDark ? '#2D1C12' : '#FFF9F2';
                      }

                      return (
                        <View
                          key={index}
                          style={[
                            styles.otpBox,
                            {
                              borderColor,
                              backgroundColor,
                              borderWidth: isCurrent || isSuccess || isError ? 2 : 1.5,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.otpDigitText,
                              { color: colors.text },
                              isSuccess && { color: '#059669' },
                              isError && { color: '#DC2626' },
                            ]}
                          >
                            {digit}
                          </Text>
                          {isCurrent && !digit && (
                            <View
                              style={[styles.otpCursor, { backgroundColor: colors.primary }]}
                            />
                          )}
                        </View>
                      );
                    })}

                    {/* Hidden Accessible TextInput overlay */}
                    <TextInput
                      ref={otpInputRef}
                      style={styles.hiddenOtpInput}
                      value={otp}
                      onChangeText={(val) => {
                        const cleaned = val.replace(/\D/g, '').slice(0, 6);
                        setOtp(cleaned);
                        if (touched.otp || cleaned.length > 0) validateStep2Field('otp', cleaned);
                      }}
                      onFocus={() => {
                        setIsOtpFocused(true);
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                      }}
                      onBlur={() => {
                        setIsOtpFocused(false);
                        setTouched((prev) => ({ ...prev, otp: true }));
                        validateStep2Field('otp', otp);
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                    />
                  </TouchableOpacity>

                  {touched.otp && fieldErrors.otp && (
                    <View style={styles.fieldErrorRow}>
                      <Feather name="alert-circle" size={12} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.otp}</Text>
                    </View>
                  )}
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                    {touched.newPassword && !fieldErrors.newPassword && newPassword.length >= 8 && (
                      <View style={styles.validPill}>
                        <Feather name="check" size={12} color="#059669" />
                        <Text style={styles.validPillText}>Secure</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark
                          ? (touched.newPassword && fieldErrors.newPassword ? '#2D1418' : (touched.newPassword && !fieldErrors.newPassword && newPassword.length >= 8 ? '#062B1D' : '#0B0F19'))
                          : (touched.newPassword && fieldErrors.newPassword ? '#FEF2F2' : (touched.newPassword && !fieldErrors.newPassword && newPassword.length >= 8 ? '#F0FDF4' : '#F9FBFD')),
                        borderColor: touched.newPassword && fieldErrors.newPassword
                          ? '#EF4444'
                          : (touched.newPassword && !fieldErrors.newPassword && newPassword.length >= 8 ? '#10B981' : colors.border),
                      },
                    ]}
                  >
                    <Feather
                      name="lock"
                      size={18}
                      color={
                        touched.newPassword && fieldErrors.newPassword
                          ? '#EF4444'
                          : (touched.newPassword && !fieldErrors.newPassword && newPassword.length >= 8 ? '#10B981' : colors.textMuted)
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Minimum 8 characters"
                      placeholderTextColor={colors.textMuted}
                      value={newPassword}
                      onChangeText={(val) => {
                        setNewPassword(val);
                        if (touched.newPassword || val.length > 0) validateStep2Field('newPassword', val);
                      }}
                      onFocus={() => {
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, newPassword: true }));
                        validateStep2Field('newPassword', newPassword);
                      }}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeBtn}
                    >
                      <Feather
                        name={showNewPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.newPassword && fieldErrors.newPassword && (
                    <View style={styles.fieldErrorRow}>
                      <Feather name="alert-circle" size={12} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.newPassword}</Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                    {touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword.length >= 8 && (
                      <View style={styles.validPill}>
                        <Feather name="check" size={12} color="#059669" />
                        <Text style={styles.validPillText}>Matches</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark
                          ? (touched.confirmPassword && fieldErrors.confirmPassword ? '#2D1418' : (touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword.length >= 8 ? '#062B1D' : '#0B0F19'))
                          : (touched.confirmPassword && fieldErrors.confirmPassword ? '#FEF2F2' : (touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword.length >= 8 ? '#F0FDF4' : '#F9FBFD')),
                        borderColor: touched.confirmPassword && fieldErrors.confirmPassword
                          ? '#EF4444'
                          : (touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword.length >= 8 ? '#10B981' : colors.border),
                      },
                    ]}
                  >
                    <Feather
                      name="check-circle"
                      size={18}
                      color={
                        touched.confirmPassword && fieldErrors.confirmPassword
                          ? '#EF4444'
                          : (touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword.length >= 8 ? '#10B981' : colors.textMuted)
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Re-type new password"
                      placeholderTextColor={colors.textMuted}
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (touched.confirmPassword || val.length > 0) validateStep2Field('confirmPassword', val);
                      }}
                      onFocus={() => {
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, confirmPassword: true }));
                        validateStep2Field('confirmPassword', confirmPassword);
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeBtn}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && fieldErrors.confirmPassword && (
                    <View style={styles.fieldErrorRow}>
                      <Feather name="alert-circle" size={12} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
                    </View>
                  )}
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, resetLoading && styles.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={resetLoading}
                  activeOpacity={0.8}
                >
                  {resetLoading ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <View style={styles.btnInner}>
                      <Text style={styles.primaryBtnText}>Set New Password</Text>
                      <Feather name="check" size={16} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Resend Code Link */}
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleRequestOtp}
                  disabled={forgotLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendText}>
                    Didn't receive code? <Text style={styles.boldOrange}>Resend OTP</Text>
                  </Text>
                </TouchableOpacity>

                {/* Change Email Button inside Form */}
                <TouchableOpacity
                  style={styles.changeEmailBtn}
                  onPress={handleChangeEmail}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={14} color={Colors.primaryDark} />
                  <Text style={styles.changeEmailBtnText}>Change Email</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 3: SUCCESS STATE ================= */}
            {step === 3 && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.successBadgeWrapper}>
                  <View
                    style={[
                      styles.successIconCircle,
                      {
                        backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                        borderColor: isDark ? '#059669' : '#A7F3D0',
                      },
                    ]}
                  >
                    <Feather name="check" size={36} color={isDark ? '#6EE7B7' : '#059669'} />
                  </View>
                </View>

                <Text style={[styles.title, { textAlign: 'center', color: colors.text }]}>
                  Password Reset Complete!
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { textAlign: 'center', marginBottom: 24, color: colors.textSecondary },
                  ]}
                >
                  Your password has been successfully updated. You can now log in using your new credentials.
                </Text>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    resetResetPasswordFields();
                    if (onResetSuccess) onResetSuccess();
                    else onBackToLogin();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.btnInner}>
                    <Text style={styles.primaryBtnText}>Proceed to Sign In</Text>
                    <Feather name="arrow-right" size={16} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  topLeftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backIconCircle: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeftBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
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
  brandIconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandIconWrapperCompact: {
    marginBottom: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  iconCircleCompact: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  card: {
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  errorBanner: {
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
  errorBannerText: {
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
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
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  returnToLoginBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  returnToLoginText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  boldOrange: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  resendBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  changeEmailBtn: {
    marginTop: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeEmailBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  successBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    maxWidth: 48,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  otpDigitText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  otpCursor: {
    position: 'absolute',
    bottom: 10,
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  hiddenOtpInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.01,
    color: 'transparent',
  },
});
