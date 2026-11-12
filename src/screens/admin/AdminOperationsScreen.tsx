import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components';
import { useTheme } from '../../context';

export const AdminOperationsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  const adminModules = [
    { title: 'Campus & Location Hierarchy', sub: '2 Campuses, 6 Buildings, 24 Floors, 140 Rooms', icon: 'map', color: '#3B82F6' },
    { title: 'Asset Inventory & QR Codes', sub: '350 Assets, Lifecycle Tracking & Printable QR Labels', icon: 'box', color: '#F16E00' },
    { title: 'Security Roles & Permissions', sub: '8 System Roles, Granular Read/Write/Verify Rules', icon: 'shield', color: '#8B5CF6' },
    { title: 'SLA Escalation Rules', sub: 'Critical (4h), High (12h), Auto-escalate to Facility Head', icon: 'clock', color: '#EF4444' },
    { title: 'System Audit Logs', sub: 'Full tamper-evident record of user edits & status changes', icon: 'file-text', color: '#10B981' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card
        style={[
          styles.adminBanner,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.bannerRow}>
          <View style={[styles.badgeWrap, { backgroundColor: colors.primary }]}>
            <Feather name="settings" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>System Administration</Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Configure campus infrastructure, access control & policies
            </Text>
          </View>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Core Administration Modules</Text>
      {adminModules.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          onPress={() => Alert.alert(item.title, `Configuring ${item.title}`)}
        >
          <Card style={styles.moduleCard}>
            <View style={[styles.moduleIconBox, { backgroundColor: item.color }]}>
              <Feather name={item.icon as any} size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.moduleSub, { color: colors.textSecondary }]}>{item.sub}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Card>
        </TouchableOpacity>
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
  adminBanner: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 2,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  moduleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  moduleSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});

