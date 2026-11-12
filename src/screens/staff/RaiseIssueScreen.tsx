import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as yup from 'yup';
import { PriorityLevel } from '../../types';
import {
  LocationBuildingNode,
  LocationCampusNode,
  LocationFloorNode,
  LocationRoomNode,
} from '../../types/complaint.types';
import { Card, Button, ConfirmationModal } from '../../components';
import { useTheme } from '../../context';
import {
  useAppDispatch,
  useAppSelector,
  fetchComplaintCategoriesThunk,
  fetchLocationsTreeThunk,
  fetchMyComplaintsThunk,
  createComplaintThunk,
  submitQrComplaintThunk,
  clearScannedAsset,
  clearScannedLocation,
  clearComplaintErrors,
} from '../../store';
import {
  raiseComplaintYupSchema,
  qrComplaintYupSchema,
} from '../../helpers/validation.helper';

interface RaiseIssueScreenProps {
  onSuccess: () => void;
  onOpenScanner?: () => void;
}

interface PickerOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface SelectPickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: string;
  onSelect: (option: PickerOption) => void;
  onClose: () => void;
}

const SelectPickerModal: React.FC<SelectPickerModalProps> = ({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.pickerCloseBtn,
                { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' },
              ]}
            >
              <Feather name="x" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator>
            {options.length === 0 ? (
              <Text style={[styles.pickerEmpty, { color: colors.textSecondary }]}>
                No options available
              </Text>
            ) : (
              options.map((opt) => {
                const isSelected = opt.id === selectedId;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.pickerOption,
                      {
                        borderBottomColor: colors.borderLight,
                        backgroundColor: isSelected
                          ? isDark
                            ? '#2D1C12'
                            : '#FFF9F2'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      onSelect(opt);
                      onClose();
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.pickerOptionLabel,
                          { color: isSelected ? colors.primary : colors.text },
                          isSelected && { fontWeight: '800' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {opt.subLabel ? (
                        <Text style={[styles.pickerOptionSub, { color: colors.textMuted }]}>
                          {opt.subLabel}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export const RaiseIssueScreen: React.FC<RaiseIssueScreenProps> = ({
  onSuccess,
  onOpenScanner,
}) => {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();

  const user = useAppSelector((state) => state.login.user);
  const {
    categories,
    locationsTree,
    scannedAsset,
    scannedLocation,
    loadingLocations,
    submitting,
    submitError,
  } = useAppSelector((state) => state.complaints);

  // Location selection states (manual mode)
  const [campusId, setCampusId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [activePicker, setActivePicker] = useState<
    'campus' | 'building' | 'floor' | 'room' | 'category' | null
  >(null);

  // Issue fields
  const [category, setCategory] = useState('Electrical');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Validation & feedback state
  type FormField =
    | 'campusId'
    | 'buildingId'
    | 'category'
    | 'priority'
    | 'title'
    | 'description'
    | 'assetCode';

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [successTicketNum, setSuccessTicketNum] = useState<string | null>(null);
  const pickerSelectedRef = useRef(false);

  const priorities: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  // Load categories & location tree on mount
  useEffect(() => {
    dispatch(clearComplaintErrors());
    dispatch(fetchComplaintCategoriesThunk());
    dispatch(fetchLocationsTreeThunk());
  }, [dispatch]);

  // Keep default category synced with loaded categories
  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.name === category)) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Auto-select campus if there is only one (and no scanned location)
  useEffect(() => {
    if (locationsTree.length === 1 && !campusId && !scannedLocation) {
      setCampusId(locationsTree[0].id);
      setFieldErrors((prev) => {
        if (!prev.campusId) return prev;
        const next = { ...prev };
        delete next.campusId;
        return next;
      });
    }
  }, [locationsTree, campusId, scannedLocation]);

  // Keep field errors scoped cleanly to active mode (QR Asset vs Manual/Location)
  useEffect(() => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (scannedAsset) {
        delete next.campusId;
        delete next.buildingId;
      } else {
        delete next.assetCode;
      }
      return next;
    });
  }, [scannedAsset]);

  // Auto-fill Campus -> Building -> Floor -> Room when a Location QR is scanned
  useEffect(() => {
    if (!scannedLocation) return;
    if (scannedLocation.locationType === 'Campus') {
      setCampusId(scannedLocation.id || '');
      setBuildingId('');
      setFloorId('');
      setRoomId('');
    } else if (scannedLocation.locationType === 'Building') {
      setCampusId(scannedLocation.hierarchy?.campus?.id || '');
      setBuildingId(scannedLocation.id || '');
      setFloorId('');
      setRoomId('');
    } else if (scannedLocation.locationType === 'Floor') {
      setCampusId(scannedLocation.hierarchy?.campus?.id || '');
      setBuildingId(scannedLocation.hierarchy?.building?.id || '');
      setFloorId(scannedLocation.id || '');
      setRoomId('');
    } else if (scannedLocation.locationType === 'Room') {
      setCampusId(scannedLocation.hierarchy?.campus?.id || '');
      setBuildingId(scannedLocation.hierarchy?.building?.id || '');
      setFloorId(scannedLocation.hierarchy?.floor?.id || '');
      setRoomId(scannedLocation.id || '');
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.campusId;
      delete next.buildingId;
      return next;
    });
  }, [scannedLocation]);

  const selectedCampus: LocationCampusNode | undefined = useMemo(
    () => locationsTree.find((c) => c.id === campusId),
    [locationsTree, campusId]
  );

  const buildings: LocationBuildingNode[] = selectedCampus?.buildings || [];
  const selectedBuilding: LocationBuildingNode | undefined = useMemo(
    () => buildings.find((b) => b.id === buildingId),
    [buildings, buildingId]
  );

  const floors: LocationFloorNode[] = selectedBuilding?.floors || [];
  const selectedFloor: LocationFloorNode | undefined = useMemo(
    () => floors.find((f) => f.id === floorId),
    [floors, floorId]
  );

  const rooms: LocationRoomNode[] = selectedFloor?.rooms || [];
  const selectedRoom: LocationRoomNode | undefined = useMemo(
    () => rooms.find((r) => r.id === roomId),
    [rooms, roomId]
  );

  const validateField = async (
    field: FormField,
    overrides: Partial<Record<FormField, string>> = {}
  ) => {
    if (scannedAsset && (field === 'campusId' || field === 'buildingId')) {
      return;
    }
    if (!scannedAsset && field === 'assetCode') {
      return;
    }

    const formValues = {
      assetCode: scannedAsset?.assetCode || '',
      campusId,
      buildingId,
      category,
      priority,
      title,
      description,
      ...overrides,
    };

    const activeSchema = scannedAsset
      ? qrComplaintYupSchema
      : raiseComplaintYupSchema;

    try {
      await activeSchema.validateAt(field, formValues);
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
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

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (submitError) dispatch(clearComplaintErrors());
    if (touched.title || val.length > 0) {
      validateField('title', { title: val });
    }
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (submitError) dispatch(clearComplaintErrors());
    if (touched.description || val.length > 0) {
      validateField('description', { description: val });
    }
  };

  const handleBlur = (field: 'title' | 'description') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handlePickerClose = () => {
    const closingPicker = activePicker;
    const wasSelected = pickerSelectedRef.current;
    pickerSelectedRef.current = false;
    setActivePicker(null);

    if (
      !wasSelected &&
      (closingPicker === 'campus' ||
        closingPicker === 'building' ||
        closingPicker === 'category')
    ) {
      const field: FormField =
        closingPicker === 'campus'
          ? 'campusId'
          : closingPicker === 'building'
          ? 'buildingId'
          : 'category';
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFieldErrors({});
    setTouched({});
    dispatch(clearScannedAsset());
    dispatch(clearScannedLocation());
  };

  const handleSubmit = async () => {
    dispatch(clearComplaintErrors());
    setTouched(
      scannedAsset
        ? {
            assetCode: true,
            category: true,
            priority: true,
            title: true,
            description: true,
          }
        : {
            campusId: true,
            buildingId: true,
            category: true,
            priority: true,
            title: true,
            description: true,
          }
    );

    const requesterName = user?.fullName?.trim() || 'Campus Staff';
    const requesterRole = user?.roles?.[0] || 'Staff';
    const requesterEmail = user?.email?.trim() || 'staff@yenmin.edu';
    const requesterPhone = user?.phone?.trim() || '+919000000000';

    try {
      if (scannedAsset) {
        await qrComplaintYupSchema.validate(
          {
            assetCode: scannedAsset.assetCode,
            category,
            priority,
            title: title.trim(),
            description: description.trim(),
          },
          { abortEarly: false }
        );
        setFieldErrors({});

        const result = await dispatch(
          submitQrComplaintThunk({
            assetCode: scannedAsset.assetCode,
            issueCategory: category,
            priority,
            title: title.trim(),
            description: description.trim(),
            requesterName,
            requesterRole,
            requesterPhone,
            requesterEmail,
          })
        );

        if (submitQrComplaintThunk.fulfilled.match(result)) {
          await dispatch(fetchMyComplaintsThunk({ requesterEmail }));
          setSuccessTicketNum(result.payload.ticketNumber);
          resetForm();
        }
      } else {
        await raiseComplaintYupSchema.validate(
          {
            campusId,
            buildingId,
            category,
            priority,
            title: title.trim(),
            description: description.trim(),
          },
          { abortEarly: false }
        );
        setFieldErrors({});

        const result = await dispatch(
          createComplaintThunk({
            campusId,
            buildingId,
            floorId: floorId || undefined,
            roomId: roomId || undefined,
            category,
            priority,
            title: title.trim(),
            description: description.trim(),
            requesterName,
            requesterRole,
            requesterEmail,
            requesterPhone,
          })
        );

        if (createComplaintThunk.fulfilled.match(result)) {
          setSuccessTicketNum(result.payload.ticketNumber);
          resetForm();
        }
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errs: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path && !errs[e.path]) {
            errs[e.path] = e.message;
          }
        });
        setFieldErrors(errs);
      }
    }
  };

  const getPickerConfig = (): {
    title: string;
    options: PickerOption[];
    selectedId: string;
    onSelect: (opt: PickerOption) => void;
  } => {
    if (activePicker === 'category') {
      return {
        title: 'Select Issue Category',
        options: categories.map((cat) => ({
          id: cat.name,
          label: cat.name,
          subLabel: cat.description || undefined,
        })),
        selectedId: category,
        onSelect: (opt) => {
          pickerSelectedRef.current = true;
          setCategory(opt.id);
          setTouched((prev) => ({ ...prev, category: true }));
          validateField('category', { category: opt.id });
        },
      };
    }
    if (activePicker === 'campus') {
      return {
        title: 'Select Campus',
        options: locationsTree.map((c) => ({
          id: c.id,
          label: c.name,
          subLabel: `${c.buildings?.length || 0} buildings`,
        })),
        selectedId: campusId,
        onSelect: (opt) => {
          pickerSelectedRef.current = true;
          setCampusId(opt.id);
          setBuildingId('');
          setFloorId('');
          setRoomId('');
          setTouched((prev) => ({ ...prev, campusId: true }));
          validateField('campusId', { campusId: opt.id, buildingId: '' });
          if (touched.buildingId) {
            validateField('buildingId', { campusId: opt.id, buildingId: '' });
          }
        },
      };
    }
    if (activePicker === 'building') {
      return {
        title: 'Select Building',
        options: buildings.map((b) => ({
          id: b.id,
          label: b.name,
          subLabel: `${b.floors?.length || 0} floors`,
        })),
        selectedId: buildingId,
        onSelect: (opt) => {
          pickerSelectedRef.current = true;
          setBuildingId(opt.id);
          setFloorId('');
          setRoomId('');
          setTouched((prev) => ({ ...prev, buildingId: true }));
          validateField('buildingId', { buildingId: opt.id });
        },
      };
    }
    if (activePicker === 'floor') {
      return {
        title: 'Select Floor (Optional)',
        options: floors.map((f) => ({
          id: f.id,
          label: f.floorName,
          subLabel: `${f.rooms?.length || 0} rooms`,
        })),
        selectedId: floorId,
        onSelect: (opt) => {
          pickerSelectedRef.current = true;
          setFloorId(opt.id);
          setRoomId('');
        },
      };
    }
    return {
      title: 'Select Room (Optional)',
      options: rooms.map((r) => ({
        id: r.id,
        label: r.roomNumber ? `${r.roomNumber} - ${r.name}` : r.name,
      })),
      selectedId: roomId,
      onSelect: (opt) => {
        pickerSelectedRef.current = true;
        setRoomId(opt.id);
      },
    };
  };

  const pickerConfig = getPickerConfig();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* QR Scanned Equipment Card OR Scan Shortcut */}
        {scannedAsset ? (
          <Card
            style={[
              styles.scannedBannerCard,
              {
                borderColor: '#10B981',
                backgroundColor: isDark ? '#062B1D' : '#ECFDF5',
              },
            ]}
          >
            <View style={styles.scannedRow}>
              <View style={styles.scannedIconBox}>
                <Feather name="cpu" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scannedTag}>
                  QR ASSET LINKED • {scannedAsset.assetCode}
                </Text>
                <Text style={[styles.scannedName, { color: colors.text }]}>
                  {scannedAsset.name}
                </Text>
                <Text style={[styles.scannedLoc, { color: colors.textSecondary }]}>
                  {scannedAsset.location || 'Main Campus'}
                </Text>
              </View>
            </View>
            <View style={styles.scannedActionsRow}>
              {onOpenScanner && (
                <TouchableOpacity
                  style={[styles.smallOutlineBtn, { borderColor: '#10B981' }]}
                  onPress={onOpenScanner}
                >
                  <Feather name="maximize" size={12} color="#059669" />
                  <Text style={styles.smallOutlineText}>Re-scan QR</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.smallOutlineBtn, { borderColor: colors.border }]}
                onPress={() => dispatch(clearScannedAsset())}
              >
                <Feather name="x" size={12} color={colors.textSecondary} />
                <Text
                  style={[styles.smallOutlineText, { color: colors.textSecondary }]}
                >
                  Manual Location Instead
                </Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.assetCode && (
              <Text style={[styles.fieldError, { marginTop: 6 }]}>
                {fieldErrors.assetCode}
              </Text>
            )}
          </Card>
        ) : scannedLocation ? (
          <Card
            style={[
              styles.scannedBannerCard,
              {
                borderColor: colors.primary,
                backgroundColor: isDark ? '#2D1C12' : '#FFF7ED',
              },
            ]}
          >
            <View style={styles.scannedRow}>
              <View
                style={[
                  styles.scannedIconBox,
                  { backgroundColor: 'rgba(245, 130, 32, 0.16)' },
                ]}
              >
                <Feather name="map-pin" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scannedTag, { color: colors.primary }]}>
                  {scannedLocation.locationType.toUpperCase()} QR LINKED
                  {scannedLocation.roomNumber || scannedLocation.code
                    ? ` • ${scannedLocation.roomNumber || scannedLocation.code}`
                    : ''}
                </Text>
                <Text style={[styles.scannedName, { color: colors.text }]}>
                  {scannedLocation.name}
                </Text>
                {scannedLocation.breadcrumb ? (
                  <Text style={[styles.scannedLoc, { color: colors.textSecondary }]}>
                    {scannedLocation.breadcrumb}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.scannedActionsRow}>
              {onOpenScanner && (
                <TouchableOpacity
                  style={[styles.smallOutlineBtn, { borderColor: colors.primary }]}
                  onPress={onOpenScanner}
                >
                  <Feather name="maximize" size={12} color={colors.primary} />
                  <Text style={[styles.smallOutlineText, { color: colors.primary }]}>
                    Re-scan QR
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.smallOutlineBtn, { borderColor: colors.border }]}
                onPress={() => dispatch(clearScannedLocation())}
              >
                <Feather name="x" size={12} color={colors.textSecondary} />
                <Text
                  style={[styles.smallOutlineText, { color: colors.textSecondary }]}
                >
                  Clear QR Link
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          onOpenScanner && (
            <TouchableOpacity
              style={[
                styles.qrShortcutBanner,
                {
                  backgroundColor: isDark ? '#2D1C12' : '#FFF7ED',
                  borderColor: isDark ? '#5A2E14' : '#FED7AA',
                },
              ]}
              onPress={onOpenScanner}
              activeOpacity={0.8}
            >
              <View style={[styles.qrShortcutIcon, { backgroundColor: colors.primary }]}>
                <Feather name="maximize" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.qrShortcutTitle, { color: colors.text }]}>
                  Have a Location or Equipment QR?
                </Text>
                <Text style={[styles.qrShortcutSub, { color: colors.textSecondary }]}>
                  Tap to scan Asset, Room, Floor, Building or Campus QR
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.primary} />
            </TouchableOpacity>
          )
        )}

        {/* API Error Banner */}
        {submitError && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorBannerText}>{submitError}</Text>
          </View>
        )}

        <Card>
          {/* Manual Campus -> Building -> Floor -> Room Pickers (when no QR asset) */}
          {!scannedAsset && (
            <View style={{ marginBottom: 14 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
                  Campus & Room Location *
                </Text>
                {loadingLocations && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </View>

              {/* Campus Select */}
              <TouchableOpacity
                style={[
                  styles.selectBox,
                  {
                    borderColor: fieldErrors.campusId ? '#EF4444' : colors.border,
                    backgroundColor: isDark ? '#1A2333' : colors.surface,
                  },
                ]}
                onPress={() => setActivePicker('campus')}
              >
                <Feather name="globe" size={15} color={colors.primary} />
                <Text
                  style={[
                    styles.selectText,
                    { color: selectedCampus ? colors.text : colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {selectedCampus ? selectedCampus.name : 'Select Campus *'}
                </Text>
                <Feather name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              {fieldErrors.campusId && (
                <Text style={styles.fieldError}>{fieldErrors.campusId}</Text>
              )}

              {/* Building Select */}
              <TouchableOpacity
                style={[
                  styles.selectBox,
                  {
                    marginTop: 8,
                    borderColor: fieldErrors.buildingId ? '#EF4444' : colors.border,
                    backgroundColor: isDark ? '#1A2333' : colors.surface,
                    opacity: selectedCampus ? 1 : 0.6,
                  },
                ]}
                disabled={!selectedCampus}
                onPress={() => setActivePicker('building')}
              >
                <Feather name="home" size={15} color={colors.primary} />
                <Text
                  style={[
                    styles.selectText,
                    { color: selectedBuilding ? colors.text : colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {selectedBuilding ? selectedBuilding.name : 'Select Building *'}
                </Text>
                <Feather name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              {fieldErrors.buildingId && (
                <Text style={styles.fieldError}>{fieldErrors.buildingId}</Text>
              )}

              {/* Floor & Room Row */}
              <View style={styles.twoColRow}>
                <TouchableOpacity
                  style={[
                    styles.selectBox,
                    {
                      flex: 1,
                      borderColor: colors.border,
                      backgroundColor: isDark ? '#1A2333' : colors.surface,
                      opacity: selectedBuilding ? 1 : 0.6,
                    },
                  ]}
                  disabled={!selectedBuilding}
                  onPress={() => setActivePicker('floor')}
                >
                  <Text
                    style={[
                      styles.selectText,
                      { color: selectedFloor ? colors.text : colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedFloor ? selectedFloor.floorName : 'Floor (Opt)'}
                  </Text>
                  <Feather name="chevron-down" size={15} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectBox,
                    {
                      flex: 1,
                      borderColor: colors.border,
                      backgroundColor: isDark ? '#1A2333' : colors.surface,
                      opacity: selectedFloor ? 1 : 0.6,
                    },
                  ]}
                  disabled={!selectedFloor}
                  onPress={() => setActivePicker('room')}
                >
                  <Text
                    style={[
                      styles.selectText,
                      { color: selectedRoom ? colors.text : colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedRoom
                      ? selectedRoom.roomNumber || selectedRoom.name
                      : 'Room (Opt)'}
                  </Text>
                  <Feather name="chevron-down" size={15} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Issue Category Select Field */}
          <Text style={[styles.label, { color: colors.text }]}>Issue Category *</Text>
          <TouchableOpacity
            style={[
              styles.selectBox,
              {
                borderColor: fieldErrors.category ? '#EF4444' : colors.border,
                backgroundColor: isDark ? '#1A2333' : colors.surface,
              },
            ]}
            onPress={() => setActivePicker('category')}
            activeOpacity={0.75}
          >
            <Feather name="tag" size={15} color={colors.primary} />
            <Text
              style={[
                styles.selectText,
                { color: category ? colors.text : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {category || 'Select Issue Category *'}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          {fieldErrors.category && (
            <Text style={styles.fieldError}>{fieldErrors.category}</Text>
          )}

          {/* Priority Severity */}
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>
            Priority Severity *
          </Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => {
              const isActive = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    {
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive
                        ? colors.primary
                        : isDark
                        ? '#1A2333'
                        : colors.surface,
                    },
                  ]}
                  onPress={() => {
                    setPriority(p);
                    setTouched((prev) => ({ ...prev, priority: true }));
                    validateField('priority', { priority: p });
                  }}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {fieldErrors.priority && (
            <Text style={styles.fieldError}>{fieldErrors.priority}</Text>
          )}

          {/* Complaint Title */}
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>
            Complaint Title *
          </Text>
          <TextInput
            style={[
              styles.textInputFlat,
              {
                borderColor: fieldErrors.title ? '#EF4444' : colors.border,
                backgroundColor: isDark ? '#1A2333' : colors.surface,
                color: colors.text,
              },
            ]}
            placeholder="e.g. Projector flickering or AC water leak..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={handleTitleChange}
            onBlur={() => handleBlur('title')}
          />
          {fieldErrors.title && (
            <Text style={styles.fieldError}>{fieldErrors.title}</Text>
          )}

          {/* Detailed Description */}
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>
            Detailed Description *
          </Text>
          <TextInput
            style={[
              styles.textInputFlat,
              {
                height: 90,
                textAlignVertical: 'top',
                borderColor: fieldErrors.description ? '#EF4444' : colors.border,
                backgroundColor: isDark ? '#1A2333' : colors.surface,
                color: colors.text,
              },
            ]}
            placeholder="Describe the breakdown, noise, or symptom observed..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={description}
            onChangeText={handleDescriptionChange}
            onBlur={() => handleBlur('description')}
          />
          {fieldErrors.description && (
            <Text style={styles.fieldError}>{fieldErrors.description}</Text>
          )}
        </Card>

        <Button
          title={scannedAsset ? 'Submit QR Breakdown Report' : 'Submit Complaint Ticket'}
          icon="send"
          size="lg"
          loading={submitting}
          onPress={handleSubmit}
          style={{ marginTop: 4, marginBottom: 24 }}
        />

        {/* Cascading Location Picker Modal */}
        <SelectPickerModal
          visible={activePicker !== null}
          title={pickerConfig.title}
          options={pickerConfig.options}
          selectedId={pickerConfig.selectedId}
          onSelect={pickerConfig.onSelect}
          onClose={handlePickerClose}
        />

        {/* Ticket Created Confirmation Modal */}
        <ConfirmationModal
          visible={Boolean(successTicketNum)}
          type="success"
          title="Complaint Registered"
          message={`Ticket #${successTicketNum} has been logged and routed to the Facility Management team.`}
          confirmText="View My Requests"
          confirmIcon="check"
          showCancel={false}
          onCancel={() => {
            setSuccessTicketNum(null);
            onSuccess();
          }}
          onConfirm={() => {
            setSuccessTicketNum(null);
            onSuccess();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  qrShortcutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  qrShortcutIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrShortcutTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  qrShortcutSub: {
    fontSize: 11,
    marginTop: 2,
  },
  scannedBannerCard: {
    borderWidth: 1.5,
    padding: 14,
  },
  scannedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scannedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  scannedName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  scannedLoc: {
    fontSize: 11,
    marginTop: 1,
  },
  scannedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  smallOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  smallOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
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
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  selectText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
  },
  textInputFlat: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  fieldError: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '600',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 28,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pickerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerEmpty: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 13,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  pickerOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
