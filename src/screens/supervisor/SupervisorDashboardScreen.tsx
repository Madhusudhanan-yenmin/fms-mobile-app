import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_ISSUES } from '../../mocks/mockData';
import { Card, StatusBadge, Button } from '../../components';
import { useTheme } from '../../context';

export const SupervisorDashboardScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* 4 Operations KPI Cards */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: colors.primary }]}>14</Text>
          <Text style={[styles.kpiLabel, { color: colors.text }]}>Open Tickets</Text>
          <Text style={[styles.kpiTrend, { color: colors.textMuted }]}>+3 today</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: isDark ? '#A78BFA' : '#8B5CF6' }]}>5</Text>
          <Text style={[styles.kpiLabel, { color: colors.text }]}>In Progress</Text>
          <Text style={[styles.kpiTrend, { color: colors.textMuted }]}>4 Technicians active</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: isDark ? '#F87171' : '#EF4444' }]}>2</Text>
          <Text style={[styles.kpiLabel, { color: colors.text }]}>SLA At Risk</Text>
          <Text style={[styles.kpiTrend, { color: colors.textMuted }]}>Within 1 hour</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: isDark ? '#34D399' : '#10B981' }]}>96%</Text>
          <Text style={[styles.kpiLabel, { color: colors.text }]}>SLA Met Rate</Text>
          <Text style={[styles.kpiTrend, { color: colors.textMuted }]}>Target: 95%</Text>
        </Card>
      </View>

      {/* Critical SLA Alarm Banner */}
      <Card
        style={[
          styles.alarmCard,
          {
            backgroundColor: isDark ? '#2D1418' : '#FEF2F2',
            borderColor: isDark ? '#7F1D1D' : '#FECACA',
          },
        ]}
      >
        <View style={styles.alarmRow}>
          <View
            style={[
              styles.alarmIcon,
              { backgroundColor: isDark ? '#451217' : '#FEE2E2' },
            ]}
          >
            <Feather name="alert-triangle" size={18} color={isDark ? '#F87171' : '#EF4444'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.alarmTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
              Critical SLA Escalation (TKT-2026-0004)
            </Text>
            <Text style={[styles.alarmSub, { color: isDark ? '#F87171' : '#991B1B' }]}>
              Ceiling fan in Lecture Hall 101 has 1h 45m left to resolve.
            </Text>
          </View>
        </View>
        <Button
          title="Expedite Assignment"
          size="sm"
          variant="danger"
          style={{ marginTop: 10 }}
          onPress={() => Alert.alert('Priority Alert', 'Technician Kumar and Supervisor alerted via push notification.')}
        />
      </Card>

      {/* Staff Workload Overview */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Field Staff Workload</Text>
      <Card>
        {[
          { name: 'Kumar (Electrical & HVAC)', count: 3, status: 'On Field', badge: '#3B82F6' },
          { name: 'Santhosh (IT & Network)', count: 2, status: 'On Field', badge: '#8B5CF6' },
          { name: 'Ramu (Housekeeping Lead)', count: 4, status: 'Rounds', badge: '#10B981' },
          { name: 'Anand (Safety Auditor)', count: 1, status: 'Inspection', badge: '#F59E0B' },
        ].map((staff, idx) => (
          <View key={idx}>
            <View style={styles.staffRow}>
              <View>
                <Text style={[styles.staffName, { color: colors.text }]}>{staff.name}</Text>
                <Text style={[styles.staffStatus, { color: colors.textSecondary }]}>{staff.status}</Text>
              </View>
              <View style={[styles.taskCountBadge, { backgroundColor: staff.badge }]}>
                <Text style={styles.taskCountText}>{staff.count} Active</Text>
              </View>
            </View>
            {idx < 3 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
          </View>
        ))}
      </Card>

      {/* Recent Activity Feed */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Campus Activity</Text>
      {MOCK_ISSUES.slice(0, 3).map((issue) => (
        <Card key={issue.id} style={styles.activityCard}>
          <View style={styles.actHeader}>
            <Text style={[styles.actTicket, { color: colors.text }]}>{issue.ticketNumber}</Text>
            <StatusBadge status={issue.status} />
          </View>
          <Text style={[styles.actTitle, { color: colors.text }]}>{issue.title}</Text>
          <Text style={[styles.actRoom, { color: colors.textSecondary }]}>
            <Feather name="map-pin" size={11} color={colors.primary} /> {issue.room}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 25,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  kpiCard: {
    width: '48%',
    padding: 14,
    marginBottom: 10,
  },
  kpiNum: {
    fontSize: 24,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  kpiTrend: {
    fontSize: 10,
    marginTop: 4,
  },
  alarmCard: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alarmIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  alarmSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 2,
  },
  staffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  staffName: {
    fontSize: 13,
    fontWeight: '700',
  },
  staffStatus: {
    fontSize: 11,
    marginTop: 1,
  },
  taskCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
  },
  activityCard: {
    padding: 14,
  },
  actHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actTicket: {
    fontSize: 12,
    fontWeight: '800',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  actRoom: {
    fontSize: 11,
  },
});


