import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_ISSUES } from '../../mocks/mockData';
import { IssueItem } from '../../types';
import { IssueDetailsModal } from './IssueDetailsModal';
import { Card, StatusBadge } from '../../components';
import { useTheme } from '../../context';

export const MyAssignedIssuesScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<'All' | 'Assigned' | 'In Progress' | 'Resolved'>('All');
  const [search, setSearch] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredIssues = MOCK_ISSUES.filter((i) => {
    const matchesFilter = filter === 'All' || i.status === filter;
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.room.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openIssue = (issue: IssueItem) => {
    setSelectedIssue(issue);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input */}
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
          placeholder="Search by ticket #, equipment or room..."
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

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {(['All', 'Assigned', 'In Progress', 'Resolved'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : (isDark ? '#1A2333' : colors.surface),
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredIssues.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => openIssue(item)}>
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.ticketNum, { color: colors.text }]}>{item.ticketNumber}</Text>
                <StatusBadge status={item.status} />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.location, { color: colors.textSecondary }]}>
                <Feather name="map-pin" size={11} color={colors.primary} /> {item.building} • {item.room}
              </Text>

              <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
                <StatusBadge status={item.priority} type="priority" />
                {item.targetDeadline && (
                  <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                    Target: {item.targetDeadline.split('(')[0]}
                  </Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {filteredIssues.length === 0 && (
          <View style={styles.emptyWrap}>
            <Feather name="inbox" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Issues Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              No complaints match your current filter.
            </Text>
          </View>
        )}
      </ScrollView>

      <IssueDetailsModal
        visible={modalVisible}
        issue={selectedIssue}
        onClose={() => setModalVisible(false)}
      />
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
  filterTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 25,
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
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
  },
  location: {
    fontSize: 11,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 2,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

