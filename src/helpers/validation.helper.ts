import * as yup from 'yup';

export const loginYupSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const changePasswordYupSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

export const forgotPasswordYupSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
});

export const resetPasswordYupSchema = yup.object().shape({
  otp: yup
    .string()
    .trim()
    .required('6-digit OTP code is required')
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

export const editProfileYupSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name cannot exceed 50 characters'),
  phone: yup
    .string()
    .trim()
    .test(
      'is-valid-phone',
      'Please enter a valid phone number (e.g., +919876543210 or 9876543210)',
      (value) => {
        if (!value || value.trim() === '') return true;
        return /^(\+?[1-9]\d{0,3}[- ]?)?\d{7,12}$/.test(value.trim());
      }
    ),
  department: yup
    .string()
    .trim()
    .max(50, 'Department name cannot exceed 50 characters'),
});

export const raiseComplaintYupSchema = yup.object().shape({
  campusId: yup
    .string()
    .trim()
    .required('Please select a campus'),
  buildingId: yup
    .string()
    .trim()
    .required('Please select a building'),
  category: yup
    .string()
    .trim()
    .required('Please select an issue category'),
  priority: yup
    .string()
    .oneOf(['Low', 'Medium', 'High', 'Critical'], 'Invalid priority level')
    .required('Please select a priority level'),
  title: yup
    .string()
    .trim()
    .required('Complaint title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: yup
    .string()
    .trim()
    .required('Detailed description is required')
    .min(5, 'Please provide a brief description (at least 5 characters)'),
});

export const qrComplaintYupSchema = yup.object().shape({
  assetCode: yup
    .string()
    .trim()
    .required('Scanned asset code is required'),
  category: yup
    .string()
    .trim()
    .required('Please select an issue category'),
  priority: yup
    .string()
    .oneOf(['Low', 'Medium', 'High', 'Critical'], 'Invalid priority level')
    .required('Please select a priority level'),
  title: yup
    .string()
    .trim()
    .required('Complaint title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: yup
    .string()
    .trim()
    .required('Detailed description is required')
    .min(5, 'Please provide a brief description (at least 5 characters)'),
});



