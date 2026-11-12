import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components';
import { useTheme } from '../../context';

export const NotificationsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const notifications = [
    {
      id: 'n1',
      title: 'New Breakdown Assigned: Ceiling Fan',
      body: 'Ticket TKT-2026-0004 in Lecture Hall 101 has been assigned to you with 4h resolution target.',
      time: '15 mins ago',
      type: 'alert',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Target SLA Deadline Reminder',
      body: 'Interactive Projector in Smart Classroom 204 target deadline is within 2 hours.',
      time: '1 hour ago',
      type: 'warning',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Quality Verification Approved',
      body: 'Supervisor approved water leakage repair in Server Room 302. Ticket moved to Closed.',
      time: 'Yesterday',
      type: 'success',
      unread: false,
    },
    {
      id: 'n4',
      title: 'AMC Contract Expiring Soon',
      body: 'Epson Projector AMC Contract expires in 4 days. Contact vendor coordinator for renewal.',
      time: '2 days ago',
      type: 'info',
      unread: false,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.topBar}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>System Notifications</Text>
        <TouchableOpacity>
          <Text style={[styles.markReadText, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {notifications.map((item) => (
        <Card
          key={item.id}
          style={
            item.unread
              ? [
                  styles.unreadCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFDF9',
                    borderColor: isDark ? '#F16E00' : '#FBD38D',
                  },
                ]
              : styles.card
          }
        >
          <View style={styles.notifRow}>
            <View
              style={[
                styles.iconCircle,
                item.type === 'alert' && { backgroundColor: isDark ? '#3E1818' : '#FEF2F2' },
                item.type === 'warning' && { backgroundColor: isDark ? '#3D2A10' : '#FFFBEB' },
                item.type === 'success' && { backgroundColor: isDark ? '#143825' : '#ECFDF5' },
                item.type === 'info' && { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' },
              ]}
            >
              <Feather
                name={
                  item.type === 'alert'
                    ? 'alert-circle'
                    : item.type === 'warning'
                    ? 'clock'
                    : item.type === 'success'
                    ? 'check-circle'
                    : 'info'
                }
                size={18}
                color={
                  item.type === 'alert'
                    ? '#EF4444'
                    : item.type === 'warning'
                    ? '#F59E0B'
                    : item.type === 'success'
                    ? '#10B981'
                    : '#3B82F6'
                }
              />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
                {item.unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{item.body}</Text>
              <Text style={[styles.notifTime, { color: colors.textMuted }]}>{item.time}</Text>
            </View>
          </View>
        </Card>
      ))}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  card: {
    padding: 14,
    marginBottom: 8,
  },
  unreadCard: {
    padding: 14,
    marginBottom: 8,
    borderColor: '#FDBA74',
    backgroundColor: '#FFFBF5',
  },
  notifRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  notifBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});

