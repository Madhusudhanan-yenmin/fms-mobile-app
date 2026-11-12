import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_AMC_CONTRACTS } from '../../mocks/mockData';
import { Card, StatusBadge, Button } from '../../components';
import { useTheme } from '../../context';

export const AmcContractsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.topBanner,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.bannerIcon}>
          <Feather name="file-text" size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Active AMC Contracts</Text>
          <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
            Annual maintenance coverage for campus assets
          </Text>
        </View>
      </View>

      {MOCK_AMC_CONTRACTS.map((contract) => (
        <Card key={contract.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.code, { color: colors.text }]}>{contract.contractCode}</Text>
            <StatusBadge status={contract.status} />
          </View>

          <Text style={[styles.vendorName, { color: colors.text }]}>{contract.vendorName}</Text>
          <Text style={[styles.valueText, { color: colors.primary }]}>
            Value: {contract.contractValue}
          </Text>

          <View
            style={[
              styles.assetsBox,
              { backgroundColor: isDark ? '#1A2333' : colors.background },
            ]}
          >
            <Text style={[styles.assetsTitle, { color: colors.text }]}>
              Covered Equipment ({contract.coveredAssetsCount} assets):
            </Text>
            {contract.assetNames.map((name, idx) => (
              <Text key={idx} style={[styles.assetBullet, { color: colors.textSecondary }]}>
                • {name}
              </Text>
            ))}
          </View>

          <View style={styles.periodRow}>
            <View>
              <Text style={[styles.periodLabel, { color: colors.textMuted }]}>Contract Validity</Text>
              <Text style={[styles.periodDates, { color: colors.text }]}>
                {contract.startDate} → {contract.expiryDate}
              </Text>
            </View>
            <View
              style={[
                styles.daysBadge,
                {
                  backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                  borderColor: isDark ? '#78350F' : '#FDE68A',
                },
              ]}
            >
              <Text style={[styles.daysNum, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                {contract.daysRemaining}
              </Text>
              <Text style={[styles.daysLabel, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                days left
              </Text>
            </View>
          </View>

          <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
            <View>
              <Text style={[styles.contactName, { color: colors.text }]}>{contract.vendorContact}</Text>
              <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{contract.vendorPhone}</Text>
            </View>
            <Button
              title="Call Vendor"
              size="sm"
              icon="phone"
              variant="secondary"
              onPress={() => Alert.alert('Call Vendor', `Dialing ${contract.vendorPhone}...`)}
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
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bannerSubtitle: {
    fontSize: 11,
    marginTop: 1,
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
  code: {
    fontSize: 13,
    fontWeight: '800',
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  assetsBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  assetsTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetBullet: {
    fontSize: 11,
    lineHeight: 16,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodLabel: {
    fontSize: 10,
  },
  periodDates: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  daysBadge: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  daysNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  daysLabel: {
    fontSize: 9,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  contactName: {
    fontSize: 12,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 11,
  },
});

