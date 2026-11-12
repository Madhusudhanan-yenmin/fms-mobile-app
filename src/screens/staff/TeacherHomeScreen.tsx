import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ComplaintItem } from '../../types/complaint.types';
import { Card, StatusBadge } from '../../components';
import { useTheme } from '../../context';
import {
  useAppDispatch,
  useAppSelector,
  fetchMyComplaintsThunk,
  submitComplaintFeedbackThunk,
} from '../../store';
import { ComplaintDetailModal } from './ComplaintDetailModal';

interface TeacherHomeScreenProps {
  onNavigateToScan: () => void;
  onNavigateToRaise: () => void;
  focusListOnly?: boolean;
}

type FilterTab = 'All' | 'Open' | 'Resolved' | 'Closed';

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onNavigateToScan,
  onNavigateToRaise,
  focusListOnly = false,
}) => {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();

  const user = useAppSelector((state) => state.login.user);
  const { items, loadingList, error } = useAppSelector(
    (state) => state.complaints
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterTab>('All');
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintItem | null>(null);
  const [ratingLoadingId, setRatingLoadingId] = useState<string | null>(null);

  const loadComplaints = async () => {
    await dispatch(
      fetchMyComplaintsThunk({
        limit: 50,
        ...(user?.isAdmin && user?.email ? { requesterEmail: user.email } : {}),
      })
    );
  };

  useEffect(() => {
    loadComplaints();
  }, [user?.email]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComplaints();
    setRefreshing(false);
  };

  const handleQuickRate = async (complaintId: string, stars: number) => {
    setRatingLoadingId(complaintId);
    try {
      await dispatch(
        submitComplaintFeedbackThunk({
          complaintId,
          payload: { rating: stars },
        })
      );
    } finally {
      setRatingLoadingId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'Open') {
        if (!['Raised', 'Assigned', 'In Progress'].includes(item.status)) {
          return false;
        }
      } else if (statusFilter === 'Resolved') {
        if (!['Resolved', 'Verified'].includes(item.status)) {
          return false;
        }
      } else if (statusFilter === 'Closed') {
        if (item.status !== 'Closed') {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.ticketNumber.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.roomName || '').toLowerCase().includes(q) ||
          (item.assetName || '').toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, statusFilter, searchQuery]);

  const filterTabs: FilterTab[] = ['All', 'Open', 'Resolved', 'Closed'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Actions Banner (hidden when focusing solely on My Complaints tab if desired, or shown cleanly) */}
        {!focusListOnly && (
          <>
            <TouchableOpacity
              style={[
                styles.scanBanner,
                {
                  backgroundColor: isDark ? '#24170E' : colors.primary,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? 'rgba(241, 110, 0, 0.42)' : 'transparent',
                  shadowColor: isDark ? '#000000' : colors.primary,
                },
              ]}
              activeOpacity={0.8}
              onPress={onNavigateToScan}
            >
              <View
                style={[
                  styles.scanIconBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(241, 110, 0, 0.2)'
                      : 'rgba(255, 255, 255, 0.2)',
                  },
                ]}
              >
                <Feather
                  name="maximize"
                  size={24}
                  color={isDark ? colors.primary : '#FFFFFF'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.scanBannerTitle,
                    { color: isDark ? colors.text : '#FFFFFF' },
                  ]}
                >
                  Scan Classroom / Equipment QR
                </Text>
                <Text
                  style={[
                    styles.scanBannerSub,
                    {
                      color: isDark ? colors.textSecondary : '#FFFFFF',
                      opacity: isDark ? 1 : 0.9,
                    },
                  ]}
                >
                  Auto-detects room & equipment code for instant service report
                </Text>
              </View>
              <Feather
                name="arrow-right"
                size={20}
                color={isDark ? colors.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.raiseActionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? '#334155' : '#FED7AA',
                  shadowColor: isDark ? '#000000' : colors.primary,
                },
              ]}
              activeOpacity={0.82}
              onPress={onNavigateToRaise}
            >
              <View
                style={[
                  styles.raiseIconBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 130, 32, 0.16)'
                      : '#FFF7ED',
                  },
                ]}
              >
                <Feather name="plus-circle" size={21} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.raiseActionTitle, { color: colors.text }]}>
                  Raise Facility or Equipment Complaint
                </Text>
                <Text
                  style={[
                    styles.raiseActionSub,
                    { color: colors.textSecondary },
                  ]}
                >
                  Select campus, building & room manually without QR
                </Text>
              </View>
              <View
                style={[
                  styles.raiseArrowPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 130, 32, 0.14)'
                      : '#FFF7ED',
                  },
                ]}
              >
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* My Submitted Requests Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            My Submitted Requests ({filteredComplaints.length})
          </Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Feather name="refresh-cw" size={14} color={colors.primary} />
            <Text style={[styles.refreshText, { color: colors.primary }]}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={15} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search ticket #, title, room, asset..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={15} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips */}
        <View style={styles.filterRow}>
          {filterTabs.map((tab) => {
            const active = statusFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : isDark
                      ? '#1E293B'
                      : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setStatusFilter(tab)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={15} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {loadingList && items.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your requests...
            </Text>
          </View>
        ) : filteredComplaints.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: isDark ? '#1E293B' : '#FFF7ED' },
              ]}
            >
              <Feather name="inbox" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Complaints Found
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {searchQuery || statusFilter !== 'All'
                ? 'Try clearing your search or status filter.'
                : 'Scan an equipment QR code or tap "Raise Facility or Equipment Complaint" to submit a new request.'}
            </Text>
          </Card>
        ) : (
          filteredComplaints.map((item) => {
            const rating = item.rating || 0;
            const showFeedbackPrompt = ['Resolved', 'Verified', 'Closed'].includes(
              item.status
            );
            const locationText = [
              item.buildingName,
              item.floorName,
              item.roomName,
            ]
              .filter(Boolean)
              .join(' • ');

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setSelectedComplaint(item)}
              >
                <Card style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.ticketRow}>
                      <Text style={[styles.ticketNum, { color: colors.text }]}>
                        {item.ticketNumber}
                      </Text>
                      <StatusBadge status={item.priority} type="priority" />
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  <Text style={[styles.issueTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>

                  <Text
                    style={[styles.issueLocation, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    <Feather name="map-pin" size={11} color={colors.primary} />{' '}
                    {locationText || item.campusName}
                    {item.assetName ? ` • ${item.assetName}` : ''}
                  </Text>

                  {item.assignedToName ? (
                    <View
                      style={[
                        styles.techAssignedBox,
                        { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' },
                      ]}
                    >
                      <Feather
                        name="user-check"
                        size={12}
                        color={isDark ? '#93C5FD' : '#1E40AF'}
                      />
                      <Text
                        style={[
                          styles.techText,
                          { color: isDark ? '#93C5FD' : '#1E40AF' },
                        ]}
                      >
                        Assigned Technician: {item.assignedToName}
                      </Text>
                    </View>
                  ) : null}

                  {/* If Resolved / Verified / Closed, allow or show 5-Star Feedback */}
                  {showFeedbackPrompt && (
                    <View
                      style={[
                        styles.feedbackBox,
                        {
                          backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                          borderColor: isDark ? '#78350F' : '#FDE68A',
                        },
                      ]}
                    >
                      <View style={styles.feedbackTopRow}>
                        <Text
                          style={[
                            styles.feedbackTitle,
                            { color: isDark ? '#FCD34D' : '#92400E' },
                          ]}
                        >
                          {rating > 0
                            ? `Rated Service: ${rating}/5 Stars`
                            : 'Issue Resolved! Rate Service:'}
                        </Text>
                        {ratingLoadingId === item.id && (
                          <ActivityIndicator size="small" color="#F59E0B" />
                        )}
                      </View>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            disabled={rating > 0 || ratingLoadingId === item.id}
                            onPress={() => handleQuickRate(item.id, star)}
                            style={styles.starTouch}
                          >
                            <Feather
                              name="star"
                              size={20}
                              color={rating >= star ? '#F59E0B' : colors.border}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View
                    style={[
                      styles.footerRow,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[styles.reportedAt, { color: colors.textMuted }]}
                    >
                      {item.reportedAt}
                    </Text>
                    <View style={styles.footerRight}>
                      <Text
                        style={[
                          styles.categoryBadge,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.category}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={14}
                        color={colors.textMuted}
                      />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Ticket Detail & Timeline Modal */}
      <ComplaintDetailModal
        visible={Boolean(selectedComplaint)}
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
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
  raiseActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  raiseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raiseActionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  raiseActionSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  raiseArrowPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  card: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  feedbackTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: '800',
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
    fontSize: 10.5,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
});
