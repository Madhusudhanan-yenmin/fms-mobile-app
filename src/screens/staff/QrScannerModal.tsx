import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  ScannedAssetInfo,
  ScannedLocationInfo,
} from '../../types/complaint.types';
import { Card, Button, StatusBadge } from '../../components';
import { useTheme } from '../../context';
import {
  useAppDispatch,
  useAppSelector,
  scanUniversalQrThunk,
  clearScannedAsset,
  clearScannedLocation,
} from '../../store';

export interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProceedToReport: (asset: ScannedAssetInfo) => void;
  onProceedToLocationReport?: (location: ScannedLocationInfo) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  visible,
  onClose,
  onProceedToReport,
  onProceedToLocationReport,
}) => {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const { scannedAsset, scannedLocation, scanningQr, scanError } =
    useAppSelector((state) => state.complaints);

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [hasScannedFrame, setHasScannedFrame] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const hasResult = Boolean(scannedAsset || scannedLocation);

  useEffect(() => {
    const handleKeyboardShow = (e: any) => {
      if (!visible) return;
      const height = e?.endCoordinates?.height || 300;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 140);
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
  }, [visible]);

  // Reset scan state each time modal opens
  useEffect(() => {
    if (visible) {
      setHasScannedFrame(false);
      setManualCode('');
      setTorchEnabled(false);
      dispatch(clearScannedAsset());
      dispatch(clearScannedLocation());
    }
  }, [visible, dispatch]);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (hasScannedFrame || scanningQr || !result?.data) return;
    setHasScannedFrame(true);
    await dispatch(scanUniversalQrThunk(result.data));
  };

  const handleManualLookup = async () => {
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    setHasScannedFrame(true);
    await dispatch(scanUniversalQrThunk(trimmed));
  };

  const handleScanAgain = () => {
    setHasScannedFrame(false);
    dispatch(clearScannedAsset());
    dispatch(clearScannedLocation());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.headerIconBtn,
              { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' },
            ]}
          >
            <Feather name="x" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Scan Campus / Equipment QR
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Point camera at equipment, room, floor, building or campus QR
            </Text>
          </View>
          {permission?.granted && !hasResult ? (
            <TouchableOpacity
              onPress={() => setTorchEnabled((prev) => !prev)}
              style={[
                styles.headerIconBtn,
                {
                  backgroundColor: torchEnabled
                    ? colors.primary
                    : isDark
                    ? '#1E293B'
                    : '#F3F4F6',
                },
              ]}
            >
              <Feather
                name="zap"
                size={18}
                color={torchEnabled ? '#FFFFFF' : colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible && { paddingBottom: Math.max(220, keyboardHeight + 24) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Camera Viewfinder OR Result Card */}
          {!hasResult ? (
            <View style={styles.cameraSection}>
              <View style={styles.cameraFrame}>
                {!permission ? (
                  <View style={styles.permissionBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.permissionText}>
                      Checking camera permission...
                    </Text>
                  </View>
                ) : !permission.granted ? (
                  <View style={styles.permissionBox}>
                    <View style={styles.permissionIconCircle}>
                      <Feather name="camera-off" size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.permissionTitle}>
                      Camera Access Needed
                    </Text>
                    <Text style={styles.permissionText}>
                      Allow camera access to scan classroom and equipment QR codes directly.
                    </Text>
                    <Button
                      title="Grant Camera Permission"
                      icon="camera"
                      onPress={requestPermission}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                ) : (
                  <>
                    <CameraView
                      style={StyleSheet.absoluteFill}
                      facing="back"
                      enableTorch={torchEnabled}
                      barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                      }}
                      onBarcodeScanned={
                        hasScannedFrame || scanningQr
                          ? undefined
                          : handleBarCodeScanned
                      }
                    />
                    {/* Scanner Target Overlay */}
                    <View style={styles.overlayMask}>
                      <View style={styles.scanTargetBox}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                        {scanningQr && (
                          <View style={styles.resolvingBadge}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.resolvingText}>
                              Resolving Asset...
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.scanHintText}>
                        Align QR code inside the frame
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Error Banner if scan failed */}
              {scanError && (
                <View style={styles.errorBanner}>
                  <Feather name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{scanError}</Text>
                  <TouchableOpacity onPress={handleScanAgain}>
                    <Text style={[styles.retryText, { color: colors.primary }]}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Manual Code Fallback */}
              <Card style={styles.manualCard}>
                <Text style={[styles.manualLabel, { color: colors.text }]}>
                  Or Enter Asset / Location Code Manually
                </Text>
                <Text style={[styles.manualSub, { color: colors.textSecondary }]}>
                  Enter asset tag (e.g. AST-PRJ-001) or room/building/campus code (e.g. LH-101, CMP-MAIN)
                </Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={[
                      styles.manualInput,
                      {
                        borderColor: colors.border,
                        backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                        color: colors.text,
                      },
                    ]}
                    placeholder="e.g. AST-PRJ-001 or LH-101"
                    placeholderTextColor={colors.textMuted}
                    value={manualCode}
                    onChangeText={setManualCode}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 140);
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleManualLookup}
                  />
                  <TouchableOpacity
                    style={[
                      styles.lookupBtn,
                      { backgroundColor: colors.primary },
                      (!manualCode.trim() || scanningQr) && { opacity: 0.6 },
                    ]}
                    onPress={handleManualLookup}
                    disabled={!manualCode.trim() || scanningQr}
                  >
                    {scanningQr ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Feather name="search" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          ) : scannedAsset ? (
            /* Scanned Asset Preview Card */
            <View style={styles.resultSection}>
              <Card style={styles.assetCard}>
                <View style={styles.verifiedHeader}>
                  <View
                    style={[
                      styles.verifiedIconCircle,
                      { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' },
                    ]}
                  >
                    <Feather
                      name="check-circle"
                      size={26}
                      color={isDark ? '#6EE7B7' : '#059669'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.verifiedTag, { color: '#059669' }]}>
                      QR ASSET VERIFIED
                    </Text>
                    <Text style={[styles.assetName, { color: colors.text }]}>
                      {scannedAsset.name}
                    </Text>
                  </View>
                </View>

                <View
                  style={[styles.divider, { backgroundColor: colors.borderLight }]}
                />

                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Asset Code
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.primary }]}>
                    {scannedAsset.assetCode}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Location
                  </Text>
                  <Text
                    style={[styles.metaValue, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {scannedAsset.location || 'Main Campus'}
                  </Text>
                </View>

                {scannedAsset.status && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Status
                    </Text>
                    <StatusBadge status={scannedAsset.status} />
                  </View>
                )}

                {scannedAsset.condition && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Condition
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedAsset.condition}
                    </Text>
                  </View>
                )}

                {scannedAsset.responsiblePerson && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Custodian
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedAsset.responsiblePerson}
                    </Text>
                  </View>
                )}
              </Card>

              <Button
                title="Report Issue for This Asset"
                icon="alert-triangle"
                size="lg"
                onPress={() => onProceedToReport(scannedAsset)}
                style={{ marginTop: 8 }}
              />

              <Button
                title="Scan Another QR Code"
                variant="outline"
                icon="refresh-cw"
                onPress={handleScanAgain}
                style={{ marginTop: 10 }}
              />
            </View>
          ) : scannedLocation ? (
            /* Scanned Campus / Building / Floor / Room Info Card */
            <View style={styles.resultSection}>
              <Card style={styles.assetCard}>
                <View style={styles.verifiedHeader}>
                  <View
                    style={[
                      styles.verifiedIconCircle,
                      { backgroundColor: isDark ? '#2D1C12' : '#FFF0DF' },
                    ]}
                  >
                    <Feather name="map-pin" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.verifiedTag, { color: colors.primary }]}>
                      {scannedLocation.locationType.toUpperCase()} QR VERIFIED
                    </Text>
                    <Text style={[styles.assetName, { color: colors.text }]}>
                      {scannedLocation.name}
                    </Text>
                  </View>
                </View>

                {scannedLocation.breadcrumb ? (
                  <Text
                    style={[
                      styles.breadcrumbText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {scannedLocation.breadcrumb}
                  </Text>
                ) : null}

                <View
                  style={[styles.divider, { backgroundColor: colors.borderLight }]}
                />

                {(scannedLocation.code || scannedLocation.roomNumber) && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      {scannedLocation.locationType === 'Room'
                        ? 'Room Number'
                        : 'Code'}
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.primary }]}>
                      {scannedLocation.roomNumber || scannedLocation.code}
                    </Text>
                  </View>
                )}

                {scannedLocation.type && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Space Type
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedLocation.type}
                    </Text>
                  </View>
                )}

                {typeof scannedLocation.capacity === 'number' && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Seating Capacity
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedLocation.capacity} seats
                    </Text>
                  </View>
                )}

                {scannedLocation.readinessStatus && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Readiness
                    </Text>
                    <StatusBadge status={scannedLocation.readinessStatus} />
                  </View>
                )}

                {(scannedLocation.inCharge ||
                  scannedLocation.supervisor ||
                  scannedLocation.contactPerson) && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      In-Charge / Contact
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedLocation.inCharge ||
                        scannedLocation.supervisor ||
                        scannedLocation.contactPerson}
                    </Text>
                  </View>
                )}

                {typeof scannedLocation.totalBuildings === 'number' && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Buildings
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedLocation.totalBuildings} Blocks
                    </Text>
                  </View>
                )}

                {typeof scannedLocation.totalFloors === 'number' && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Floors
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedLocation.totalFloors} Floors
                    </Text>
                  </View>
                )}

                {typeof scannedLocation.totalRooms === 'number' && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Rooms
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {scannedLocation.totalRooms} Rooms
                    </Text>
                  </View>
                )}

                {typeof scannedLocation.totalAssets === 'number' && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Tracked Assets
                    </Text>
                    <Text style={[styles.metaValue, { color: colors.primary }]}>
                      {scannedLocation.totalAssets} items
                    </Text>
                  </View>
                )}

                {scannedLocation.latitude != null &&
                  scannedLocation.longitude != null && (
                    <View style={styles.metaRow}>
                      <Text
                        style={[styles.metaLabel, { color: colors.textSecondary }]}
                      >
                        GPS Geofence
                      </Text>
                      <Text style={[styles.metaValue, { color: colors.text }]}>
                        {Number(scannedLocation.latitude).toFixed(4)},{' '}
                        {Number(scannedLocation.longitude).toFixed(4)}
                      </Text>
                    </View>
                  )}
              </Card>

              {onProceedToLocationReport &&
                scannedLocation.locationType === 'Room' && (
                  <Button
                    title="Report Issue in this Space"
                    icon="alert-triangle"
                    size="lg"
                    onPress={() => onProceedToLocationReport(scannedLocation)}
                    style={{ marginTop: 8 }}
                  />
                )}

              <Button
                title="Scan Another QR Code"
                variant="outline"
                icon="refresh-cw"
                onPress={handleScanAgain}
                style={{ marginTop: 10 }}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cameraSection: {
    gap: 14,
  },
  cameraFrame: {
    height: 340,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 130, 32, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  permissionText: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  overlayMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTargetBox: {
    width: 210,
    height: 210,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  resolvingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resolvingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scanHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
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
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '800',
  },
  manualCard: {
    padding: 16,
  },
  manualLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  manualSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  lookupBtn: {
    width: 48,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultSection: {
    paddingTop: 8,
  },
  assetCard: {
    padding: 18,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  assetName: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  breadcrumbText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
});
