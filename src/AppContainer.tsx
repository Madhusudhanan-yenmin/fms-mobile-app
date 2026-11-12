import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './constants/colors';
import { AppRole } from './constants/roles';
import { ROLE_NAVIGATION_TABS } from './constants/navigation';
import { Header, RoleSwitcherModal } from './components';
import { DynamicTabBar } from './navigation/DynamicTabBar';
import { useTheme } from './context';
import {
  useAppDispatch,
  useAppSelector,
  checkAuthSessionThunk,
  setActiveRole as setReduxRole,
  setScannedAsset,
  setScannedLocation,
} from './store';
import { LoginScreen, ForgotPasswordScreen } from './screens/auth';

// Screens
import { ProfileScreen } from './screens/common/ProfileScreen';
import { NotificationsScreen } from './screens/common/NotificationsScreen';
import { TechnicianHomeScreen } from './screens/technician/TechnicianHomeScreen';
import { MyAssignedIssuesScreen } from './screens/technician/MyAssignedIssuesScreen';
import { AmcContractsScreen } from './screens/amc/AmcContractsScreen';
import { CleaningTasksScreen } from './screens/housekeeping/CleaningTasksScreen';
import { SafetyInspectionsScreen } from './screens/safety/SafetyInspectionsScreen';
import { StockOverviewScreen } from './screens/inventory/StockOverviewScreen';
import { SupervisorDashboardScreen } from './screens/supervisor/SupervisorDashboardScreen';
import { AdminOperationsScreen } from './screens/admin/AdminOperationsScreen';
import { TeacherHomeScreen } from './screens/staff/TeacherHomeScreen';
import { RaiseIssueScreen } from './screens/staff/RaiseIssueScreen';
import { QrScannerModal } from './screens/staff/QrScannerModal';

export const AppContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isInitializing, activeRole } = useAppSelector((state) => state.login);

  const [currentRole, setCurrentRole] = useState<AppRole>(activeRole);
  const [activeTabKey, setActiveTabKey] = useState<string>('tech_home');
  const [roleSwitcherVisible, setRoleSwitcherVisible] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'forgot_password'>('login');

  // Check persisted session on app launch
  useEffect(() => {
    dispatch(checkAuthSessionThunk());
  }, [dispatch]);

  // Keep local role in sync when activeRole changes (e.g., after login)
  useEffect(() => {
    setCurrentRole(activeRole);
  }, [activeRole]);

  // Sync default active tab when role changes
  useEffect(() => {
    const tabs = ROLE_NAVIGATION_TABS[currentRole] || ROLE_NAVIGATION_TABS['technician'];
    if (tabs && tabs.length > 0) {
      setActiveTabKey(tabs[0].key);
    }
  }, [currentRole]);

  const handleSelectRole = (newRole: AppRole) => {
    setCurrentRole(newRole);
    dispatch(setReduxRole(newRole));
  };

  // If verifying token session from AsyncStorage on cold start
  if (isInitializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Initializing Smart Campus FMS...
        </Text>
      </View>
    );
  }

  // If not logged in, render the live Auth screens (Login / Forgot Password)
  if (!isAuthenticated) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {authView === 'forgot_password' ? (
          <ForgotPasswordScreen
            onBackToLogin={() => setAuthView('login')}
            onResetSuccess={() => setAuthView('login')}
          />
        ) : (
          <LoginScreen
            onNavigateToForgotPassword={() => setAuthView('forgot_password')}
          />
        )}
      </View>
    );
  }

  const renderCurrentScreen = () => {
    // 1. Common Tab Screens
    if (activeTabKey === 'profile') {
      return (
        <ProfileScreen
          currentRole={currentRole}
          onOpenRoleSwitcher={() => setRoleSwitcherVisible(true)}
        />
      );
    }
    if (activeTabKey === 'notifications' || activeTabKey === 'admin_alerts') {
      return <NotificationsScreen />;
    }

    // 2. Technician Tabs
    if (activeTabKey === 'tech_home') {
      return <TechnicianHomeScreen />;
    }
    if (activeTabKey === 'tech_issues') {
      return <MyAssignedIssuesScreen />;
    }
    if (activeTabKey === 'tech_tasks') {
      return <CleaningTasksScreen />;
    }

    // 3. AMC Coordinator Tabs
    if (activeTabKey.startsWith('amc_')) {
      return <AmcContractsScreen />;
    }

    // 4. Housekeeping Tabs
    if (activeTabKey === 'hk_home' || activeTabKey === 'hk_tasks') {
      return <CleaningTasksScreen />;
    }
    if (activeTabKey === 'hk_report') {
      return (
        <RaiseIssueScreen
          onSuccess={() => setActiveTabKey('hk_tasks')}
          onOpenScanner={() => setQrScannerVisible(true)}
        />
      );
    }

    // 5. Safety / Inspection Tabs
    if (activeTabKey.startsWith('safety_')) {
      return <SafetyInspectionsScreen />;
    }

    // 6. Inventory Tabs
    if (activeTabKey.startsWith('inv_')) {
      return <StockOverviewScreen />;
    }

    // 7. Supervisor Tabs
    if (activeTabKey === 'sup_dashboard' || activeTabKey === 'sup_assignments' || activeTabKey === 'sup_approvals' || activeTabKey === 'sup_reports') {
      return <SupervisorDashboardScreen />;
    }
    if (activeTabKey === 'sup_issues') {
      return <MyAssignedIssuesScreen />;
    }

    // 8. Admin Tabs
    if (activeTabKey === 'admin_dashboard') {
      return <SupervisorDashboardScreen />;
    }
    if (activeTabKey === 'admin_operations' || activeTabKey === 'admin_users') {
      return <AdminOperationsScreen />;
    }

    // 9. Teacher / Staff / Student / Lab In-charge Tabs
    if (activeTabKey === 'staff_home') {
      return (
        <TeacherHomeScreen
          onNavigateToScan={() => setQrScannerVisible(true)}
          onNavigateToRaise={() => setActiveTabKey('staff_raise')}
        />
      );
    }
    if (activeTabKey === 'staff_complaints') {
      return (
        <TeacherHomeScreen
          focusListOnly
          onNavigateToScan={() => setQrScannerVisible(true)}
          onNavigateToRaise={() => setActiveTabKey('staff_raise')}
        />
      );
    }
    if (activeTabKey === 'staff_raise') {
      return (
        <RaiseIssueScreen
          onOpenScanner={() => setQrScannerVisible(true)}
          onSuccess={() =>
            setActiveTabKey(
              currentRole === 'lab-in-charge' ? 'tech_home' : 'staff_complaints'
            )
          }
        />
      );
    }

    // Fallback
    return <TechnicianHomeScreen />;
  };

  const handleTabSelect = (tabKey: string) => {
    if (tabKey === 'staff_scan') {
      setQrScannerVisible(true);
      return;
    }
    setActiveTabKey(tabKey);
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Universal FMS Header with Role Switcher pill */}
      <Header
        currentRole={currentRole}
        onOpenRoleSwitcher={() => setRoleSwitcherVisible(true)}
      />

      {/* Screen Body */}
      <View style={[styles.body, { backgroundColor: colors.background }]}>
        {renderCurrentScreen()}
      </View>

      {/* Role-Specific Dynamic Bottom Navigation Bar */}
      <DynamicTabBar
        currentRole={currentRole}
        activeTabKey={activeTabKey}
        onSelectTab={handleTabSelect}
      />

      {/* Interactive Role Switcher Bottom Sheet */}
      <RoleSwitcherModal
        visible={roleSwitcherVisible}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onClose={() => setRoleSwitcherVisible(false)}
      />

      {/* Live Camera QR Code Scanner Modal */}
      <QrScannerModal
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onProceedToReport={(asset) => {
          dispatch(setScannedAsset(asset));
          setQrScannerVisible(false);
          setActiveTabKey(
            currentRole === 'housekeeping-supervisor' ? 'hk_report' : 'staff_raise'
          );
        }}
        onProceedToLocationReport={(location) => {
          dispatch(setScannedLocation(location));
          setQrScannerVisible(false);
          setActiveTabKey(
            currentRole === 'housekeeping-supervisor' ? 'hk_report' : 'staff_raise'
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
