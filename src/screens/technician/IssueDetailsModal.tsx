import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { IssueItem } from '../../types';
import { StatusBadge, Button, Card } from '../../components';
import { useTheme } from '../../context';

interface IssueDetailsModalProps {
  visible: boolean;
  issue: IssueItem | null;
  onClose: () => void;
  onUpdateStatus?: (newStatus: string) => void;
}

export const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  visible,
  issue,
  onClose,
  onUpdateStatus,
}) => {
  const { colors, isDark } = useTheme();

  if (!issue) return null;

  const [currentStatus, setCurrentStatus] = useState(issue.status);
  const [diagnosisNotes, setDiagnosisNotes] = useState(issue.resolutionNotes || '');
  const [sparesConsumed, setSparesConsumed] = useState(issue.sparesConsumed || '');
  const [hasBeforePhoto, setHasBeforePhoto] = useState(Boolean(issue.beforePhotoUri));
  const [hasAfterPhoto, setHasAfterPhoto] = useState(Boolean(issue.afterPhotoUri));
  
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Isolate power / MCB before starting', checked: true },
    { id: '2', label: 'Physical inspection & component multimeter check', checked: true },
    { id: '3', label: 'Replace defect / faulty spare part', checked: currentStatus === 'Resolved' },
    { id: '4', label: 'Post-repair functional trial run (15 mins)', checked: currentStatus === 'Resolved' },
    { id: '5', label: 'Clean work area & restore furniture alignment', checked: currentStatus === 'Resolved' },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleStatusChange = (status: any) => {
    setCurrentStatus(status);
    onUpdateStatus?.(status);
    Alert.alert('Status Updated', `Issue marked as "${status}".`);
  };

  const handlePhotoCapture = (type: 'before' | 'after') => {
    Alert.alert(
      'Camera Action',
      `Mobile camera active. ${type === 'before' ? 'Before-repair' : 'After-repair'} photo captured & compressed.`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (type === 'before') setHasBeforePhoto(true);
            else setHasAfterPhoto(true);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
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
            style={[styles.backBtn, { backgroundColor: isDark ? '#1A2333' : colors.background }]}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ticketNumber, { color: colors.text }]}>{issue.ticketNumber}</Text>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{issue.category}</Text>
          </View>
          <StatusBadge status={currentStatus} />
        </View>

        <ScrollView
          style={[styles.body, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Title & Description */}
          <Card>
            <View style={styles.priorityRow}>
              <StatusBadge status={issue.priority} type="priority" />
              <Text style={[styles.reportedAt, { color: colors.textMuted }]}>{issue.reportedAt}</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{issue.title}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{issue.description}</Text>

            <View
              style={[
                styles.locationBox,
                { backgroundColor: isDark ? '#1A2333' : colors.background },
              ]}
            >
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {issue.building} • {issue.floor} • {issue.room}
              </Text>
            </View>

            {issue.assetCode && (
              <View
                style={[
                  styles.assetBox,
                  { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' },
                ]}
              >
                <Feather name="box" size={14} color={isDark ? '#93C5FD' : '#1E40AF'} />
                <Text style={[styles.assetText, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
                  Asset: <Text style={{ fontWeight: '700' }}>{issue.assetName}</Text> ({issue.assetCode})
                </Text>
              </View>
            )}
          </Card>

          {/* Requester Contact */}
          <Card>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Reported By</Text>
            <View style={styles.requesterRow}>
              <View>
                <Text style={[styles.requesterName, { color: colors.text }]}>{issue.reportedBy}</Text>
                <Text style={[styles.requesterPhone, { color: colors.textSecondary }]}>{issue.reportedPhone}</Text>
              </View>
              <Button
                title="Call"
                size="sm"
                icon="phone"
                variant="secondary"
                onPress={() => Alert.alert('Call Requester', `Dialing ${issue.reportedPhone}...`)}
              />
            </View>
          </Card>

          {/* Work Status Transitions */}
          <Card>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Work Status Action</Text>
            <View style={styles.statusButtonsRow}>
              {(
                [
                  { key: 'Assigned', label: 'Accepted' },
                  { key: 'In Progress', label: 'Start Work' },
                  { key: 'Resolved', label: 'Resolve' },
                ] as const
              ).map((btn) => {
                const isActive = currentStatus === btn.key;
                return (
                  <TouchableOpacity
                    key={btn.key}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: isActive
                          ? (isDark ? colors.primaryLight : colors.primaryLight)
                          : (isDark ? '#1A2333' : colors.surface),
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleStatusChange(btn.key)}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        { color: isActive ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Maintenance Checklist */}
          <Card>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Maintenance Task Checklist</Text>
            {checklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checkItem}
                onPress={() => toggleCheck(item.id)}
              >
                <Feather
                  name={item.checked ? 'check-square' : 'square'}
                  size={18}
                  color={item.checked ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.checkLabel,
                    { color: colors.text },
                    item.checked && { textDecorationLine: 'line-through', color: colors.textMuted },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Photo Evidence (Before & After) */}
          <Card>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Photo Evidence (Camera)</Text>
            <View style={styles.photosGrid}>
              <TouchableOpacity
                style={[
                  styles.photoBox,
                  {
                    borderColor: hasBeforePhoto ? '#10B981' : colors.border,
                    backgroundColor: hasBeforePhoto
                      ? (isDark ? '#064E3B' : '#ECFDF5')
                      : (isDark ? '#1A2333' : colors.background),
                  },
                ]}
                onPress={() => handlePhotoCapture('before')}
              >
                <Feather
                  name={hasBeforePhoto ? 'check-circle' : 'camera'}
                  size={24}
                  color={hasBeforePhoto ? '#10B981' : colors.primary}
                />
                <Text style={[styles.photoLabel, { color: colors.text }]}>
                  {hasBeforePhoto ? 'Before Photo Attached' : 'Capture Before'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.photoBox,
                  {
                    borderColor: hasAfterPhoto ? '#10B981' : colors.border,
                    backgroundColor: hasAfterPhoto
                      ? (isDark ? '#064E3B' : '#ECFDF5')
                      : (isDark ? '#1A2333' : colors.background),
                  },
                ]}
                onPress={() => handlePhotoCapture('after')}
              >
                <Feather
                  name={hasAfterPhoto ? 'check-circle' : 'camera'}
                  size={24}
                  color={hasAfterPhoto ? '#10B981' : colors.primary}
                />
                <Text style={[styles.photoLabel, { color: colors.text }]}>
                  {hasAfterPhoto ? 'After Photo Attached' : 'Capture After'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Spares Used & Repair Remarks */}
          <Card>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Spare Parts Consumed</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#1A2333' : colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. 1x Fan Capacitor 2.5uF, 2x M6 Screws..."
              placeholderTextColor={colors.textMuted}
              value={sparesConsumed}
              onChangeText={setSparesConsumed}
            />

            <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 12 }]}>
              Fault Diagnosis & Action Taken
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  height: 80,
                  textAlignVertical: 'top',
                  backgroundColor: isDark ? '#1A2333' : colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Explain cause of failure and corrective steps carried out..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={diagnosisNotes}
              onChangeText={setDiagnosisNotes}
            />
          </Card>

          {/* Submit for Verification */}
          <Button
            title="Submit Work for Verification"
            icon="check-circle"
            size="lg"
            onPress={() => {
              handleStatusChange('Resolved');
              Alert.alert('Submitted', 'Work details & photo evidence submitted for supervisor audit.');
              onClose();
            }}
            style={{ marginTop: 8, marginBottom: 20 }}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  ticketNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryText: {
    fontSize: 11,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportedAt: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  assetText: {
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  requesterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requesterName: {
    fontSize: 13,
    fontWeight: '700',
  },
  requesterPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkLabel: {
    fontSize: 12,
    flex: 1,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBox: {
    flex: 1,
    height: 85,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  photoLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
  },
});

