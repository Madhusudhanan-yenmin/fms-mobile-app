import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_ISSUES } from '../../mocks/mockData';
import { IssueItem } from '../../types';
import { Card, StatusBadge, Button } from '../../components';
import { useTheme } from '../../context';

interface TeacherHomeScreenProps {
  onNavigateToScan: () => void;
  onNavigateToRaise: () => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onNavigateToScan,
  onNavigateToRaise,
}) => {
  const { colors, isDark } = useTheme();
  const [ratingSubmitted, setRatingSubmitted] = useState<Record<string, number>>({});

  const myComplaints = MOCK_ISSUES.filter(
    (i) => i.reportedBy.includes('Gayathri') || i.reportedBy.includes('Teacher') || i.reportedBy.includes('Meenakshi')
  );

  const handleRate = (issueId: string, stars: number) => {
    setRatingSubmitted((prev) => ({ ...prev, [issueId]: stars }));
    Alert.alert('Feedback Recorded', `Thank you for rating this service ${stars} stars!`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Scan Classroom Barcode Card */}
      <TouchableOpacity
        style={[
          styles.scanBanner,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        activeOpacity={0.8}
        onPress={onNavigateToScan}
      >
        <View style={styles.scanIconBox}>
          <Feather name="maximize" size={24} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.scanBannerTitle}>Scan Classroom / Equipment QR</Text>
          <Text style={styles.scanBannerSub}>
            Auto-detects room & equipment code for instant service report
          </Text>
        </View>
        <Feather name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Manual Raise Button */}
      <Button
        title="Raise Facility or Equipment Complaint"
        icon="plus-circle"
        size="lg"
        onPress={onNavigateToRaise}
        style={{ marginBottom: 16 }}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          My Submitted Requests ({myComplaints.length})
        </Text>
      </View>

      {myComplaints.map((item) => {
        const rating = ratingSubmitted[item.id];

        return (
          <Card key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.ticketNum, { color: colors.text }]}>{item.ticketNumber}</Text>
              <StatusBadge status={item.status} />
            </View>

            <Text style={[styles.issueTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.issueLocation, { color: colors.textSecondary }]}>
              <Feather name="map-pin" size={11} color={colors.primary} /> {item.building} • {item.room}
            </Text>

            {item.assignedTo && (
              <View
                style={[
                  styles.techAssignedBox,
                  { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' },
                ]}
              >
                <Feather name="user-check" size={12} color={isDark ? '#93C5FD' : '#1E40AF'} />
                <Text
                  style={[
                    styles.techText,
                    { color: isDark ? '#93C5FD' : '#1E40AF' },
                  ]}
                >
                  Assigned Technician: {item.assignedTo}
                </Text>
              </View>
            )}

            {/* If Resolved, Prompt for 5-Star Feedback */}
            {item.status === 'Resolved' && (
              <View
                style={[
                  styles.feedbackBox,
                  {
                    backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                    borderColor: isDark ? '#78350F' : '#FDE68A',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.feedbackTitle,
                    { color: isDark ? '#FCD34D' : '#92400E' },
                  ]}
                >
                  Issue Resolved! Please Rate Service:
                </Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleRate(item.id, star)}
                      style={styles.starTouch}
                    >
                      <Feather
                        name="star"
                        size={22}
                        color={(rating || 0) >= star ? '#F59E0B' : colors.border}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
              <Text style={[styles.reportedAt, { color: colors.textMuted }]}>Submitted {item.reportedAt}</Text>
              <Text style={[styles.categoryBadge, { color: colors.textSecondary }]}>{item.category}</Text>
            </View>
          </Card>
        );
      })}
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
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  scanIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scanBannerSub: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeader: {
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketNum: {
    fontSize: 13,
    fontWeight: '800',
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  issueLocation: {
    fontSize: 11,
    marginBottom: 8,
  },
  techAssignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  techText: {
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starTouch: {
    padding: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 2,
  },
  reportedAt: {
    fontSize: 10,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
});

