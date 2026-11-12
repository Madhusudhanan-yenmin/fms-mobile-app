import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_ISSUES } from '../../mocks/mockData';
import { IssueItem } from '../../types';
import { IssueDetailsModal } from './IssueDetailsModal';
import { Card, Button, StatusBadge } from '../../components';
import { useTheme } from '../../context';

export const TechnicianHomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const assignedIssues = MOCK_ISSUES.filter(
    (i) => i.status === 'Assigned' || i.status === 'In Progress'
  );

  const openIssue = (issue: IssueItem) => {
    setSelectedIssue(issue);
    setModalVisible(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Technician Welcome & Duty Status */}
      <Card style={styles.dutyCard}>
        <View style={styles.dutyTop}>
          <View>
            <Text style={[styles.dutyGreeting, { color: colors.text }]}>Welcome back, Kumar</Text>
            <Text style={[styles.dutySub, { color: colors.textSecondary }]}>
              Duty: Electrical & HVAC Lead • Shift A
            </Text>
          </View>
          <View style={styles.liveDutyBadge}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.liveDutyText}>On Duty</Text>
          </View>
        </View>

        {/* 4 Fast Counters */}
        <View style={styles.counterGrid}>
          <View
            style={[
              styles.counterBox,
              {
                backgroundColor: isDark ? '#0B0F19' : '#FFF9F2',
                borderColor: isDark ? '#27354A' : '#FEEBC8',
              },
            ]}
          >
            <Text style={[styles.counterNum, { color: colors.primary }]}>{assignedIssues.length}</Text>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>My Issues</Text>
          </View>
          <View
            style={[
              styles.counterBox,
              {
                backgroundColor: isDark ? '#0B0F19' : '#FFF9F2',
                borderColor: isDark ? '#27354A' : '#FEEBC8',
              },
            ]}
          >
            <Text style={[styles.counterNum, { color: '#8B5CF6' }]}>1</Text>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>
          <View
            style={[
              styles.counterBox,
              {
                backgroundColor: isDark ? '#0B0F19' : '#FFF9F2',
                borderColor: isDark ? '#27354A' : '#FEEBC8',
              },
            ]}
          >
            <Text style={[styles.counterNum, { color: '#EF4444' }]}>1</Text>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>Critical SLA</Text>
          </View>
          <View
            style={[
              styles.counterBox,
              {
                backgroundColor: isDark ? '#0B0F19' : '#FFF9F2',
                borderColor: isDark ? '#27354A' : '#FEEBC8',
              },
            ]}
          >
            <Text style={[styles.counterNum, { color: '#10B981' }]}>2</Text>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>Closed</Text>
          </View>
        </View>
      </Card>

      {/* Fast QR Code Action */}
      <TouchableOpacity
        style={[
          styles.qrScannerBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Asset QR Scanner', 'Scanning camera opened: Align machine barcode / QR sticker.')}
      >
        <View style={styles.qrIconWrap}>
          <Feather name="maximize" size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.qrTitle, { color: colors.text }]}>Scan Asset QR Code on Machine</Text>
          <Text style={[styles.qrSubtitle, { color: colors.textSecondary }]}>
            Instant equipment specs, warranty & service history
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Urgent Assigned Work Queue */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>High Priority Work Queue</Text>
        <Text style={styles.badgeCount}>{assignedIssues.length} Pending</Text>
      </View>

      {assignedIssues.map((item) => (
        <TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => openIssue(item)}>
          <Card style={styles.issueCard}>
            <View style={styles.issueTop}>
              <Text style={[styles.ticketNum, { color: colors.text }]}>{item.ticketNumber}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <StatusBadge status={item.priority} type="priority" />
                <StatusBadge status={item.status} />
              </View>
            </View>

            <Text style={[styles.issueTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.issueLocation, { color: colors.textSecondary }]} numberOfLines={1}>
              <Feather name="map-pin" size={11} color={colors.primary} /> {item.building} • {item.floor} • {item.room}
            </Text>

            {item.targetDeadline && (
              <View
                style={[
                  styles.slaBadge,
                  { backgroundColor: isDark ? '#3D2A10' : '#FEF3C7' },
                ]}
              >
                <Feather name="clock" size={12} color={isDark ? '#FCD34D' : '#92400E'} />
                <Text style={[styles.slaText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                  Target: {item.targetDeadline}
                </Text>
              </View>
            )}

            <View style={styles.issueFooter}>
              <Text style={[styles.reportedByText, { color: colors.textMuted }]}>
                By: {item.reportedBy}
              </Text>
              <Text style={[styles.actionPrompt, { color: colors.primary }]}>
                Tap to update work →
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      <IssueDetailsModal
        visible={modalVisible}
        issue={selectedIssue}
        onClose={() => setModalVisible(false)}
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
    paddingBottom: 25,
  },
  dutyCard: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 12,
  },
  dutyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dutyGreeting: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  dutySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  liveDutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveDutyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  counterGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  counterBox: {
    flex: 1,
    alignItems: 'center',
  },
  counterNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  qrScannerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  qrIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  qrSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  badgeCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  issueCard: {
    padding: 14,
  },
  issueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketNum: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  issueLocation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  slaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  reportedByText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  actionPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});

