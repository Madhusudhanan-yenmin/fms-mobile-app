import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_SAFETY_INSPECTIONS } from '../../mocks/mockData';
import { Card, Button, StatusBadge } from '../../components';
import { useTheme } from '../../context';

export const SafetyInspectionsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.topCard}>
        <View style={styles.topCardRow}>
          <View style={styles.shieldIconBox}>
            <Feather name="shield" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.topCardTitle, { color: colors.text }]}>Campus Safety Audits</Text>
            <Text style={[styles.topCardSub, { color: colors.textSecondary }]}>
              Regulatory compliance & physical risk mitigation
            </Text>
          </View>
        </View>
      </Card>

      {MOCK_SAFETY_INSPECTIONS.map((audit) => (
        <Card key={audit.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {audit.dueDate}</Text>
            <StatusBadge status={audit.status} />
          </View>

          <Text style={[styles.auditTitle, { color: colors.text }]}>{audit.title}</Text>
          <Text style={[styles.location, { color: colors.textSecondary }]}>
            <Feather name="map-pin" size={12} color={colors.primary} /> {audit.location}
          </Text>

          <View
            style={[
              styles.statsRow,
              { backgroundColor: isDark ? '#1A2333' : colors.background },
            ]}
          >
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>
                {audit.itemsChecked}/{audit.totalItems}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Checklist Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text
                style={[
                  styles.statNum,
                  { color: audit.hazardCount > 0 ? (isDark ? '#F87171' : '#EF4444') : (isDark ? '#34D399' : '#10B981') },
                ]}
              >
                {audit.hazardCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hazards Flagged</Text>
            </View>
          </View>

          {audit.defects.length > 0 && (
            <View
              style={[
                styles.defectsBox,
                {
                  backgroundColor: isDark ? '#2D1418' : '#FEF2F2',
                  borderColor: isDark ? '#7F1D1D' : '#FECACA',
                },
              ]}
            >
              <Text style={[styles.defectHeading, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                Safety Defects Identified:
              </Text>
              {audit.defects.map((d, i) => (
                <Text key={i} style={[styles.defectText, { color: isDark ? '#F87171' : '#991B1B' }]}>
                  • {d}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.actionRow}>
            <Button
              title="Audit Checklist"
              size="sm"
              icon="check-square"
              onPress={() => Alert.alert('Audit Checklist', `Opening inspection checklist for ${audit.title}`)}
            />
            <Button
              title="Report Hazard"
              size="sm"
              variant="outline"
              icon="alert-triangle"
              onPress={() => Alert.alert('Report Hazard', 'Capture photo & raise urgent corrective ticket.')}
            />
          </View>
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
  topCard: {
    padding: 14,
    marginBottom: 12,
  },
  topCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  topCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '700',
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginBottom: 4,
  },
  location: {
    fontSize: 11,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
  },
  statNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  defectsBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  defectHeading: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  defectText: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});

