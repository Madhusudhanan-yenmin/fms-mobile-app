import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_INVENTORY_ITEMS } from '../../mocks/mockData';
import { InventoryItem } from '../../types';
import { Card, StatusBadge, Button } from '../../components';
import { useTheme } from '../../context';

export const StockOverviewScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY_ITEMS);
  const [search, setSearch] = useState('');

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssue = (item: InventoryItem) => {
    Alert.alert(
      'Issue Spare Part',
      `Issue 1 unit of ${item.name} to technician?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Issue Stock',
          onPress: () => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === item.id ? { ...it, quantityOnHand: Math.max(0, it.quantityOnHand - 1) } : it
              )
            );
            Alert.alert('Material Issued', `Updated stock quantity recorded in ledger.`);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search spare parts, consumables, codes..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.itemCode, { color: colors.text }]}>{item.code}</Text>
                <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>

            <View
              style={[
                styles.stockDetailsBox,
                { backgroundColor: isDark ? '#1A2333' : colors.background },
              ]}
            >
              <View style={styles.stockCol}>
                <Text style={[styles.stockVal, { color: colors.text }]}>
                  {item.quantityOnHand} {item.unit}
                </Text>
                <Text style={[styles.stockSub, { color: colors.textMuted }]}>On Hand</Text>
              </View>
              <View style={styles.stockCol}>
                <Text style={[styles.stockVal, { color: colors.text }]}>{item.minThreshold}</Text>
                <Text style={[styles.stockSub, { color: colors.textMuted }]}>Min Threshold</Text>
              </View>
              <View style={styles.stockCol}>
                <Text style={[styles.stockVal, { color: colors.text }]}>{item.binLocation}</Text>
                <Text style={[styles.stockSub, { color: colors.textMuted }]}>Storage Bin</Text>
              </View>
            </View>

            <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
              <Text style={[styles.costText, { color: colors.primary }]}>
                Unit Cost: {item.unitCost}
              </Text>
              <Button
                title="Issue Material"
                size="sm"
                icon="minus-circle"
                disabled={item.quantityOnHand === 0}
                onPress={() => handleIssue(item)}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 25,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
    fontWeight: '800',
  },
  category: {
    fontSize: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 10,
  },
  stockDetailsBox: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  stockCol: {
    flex: 1,
  },
  stockVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  stockSub: {
    fontSize: 10,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  costText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

