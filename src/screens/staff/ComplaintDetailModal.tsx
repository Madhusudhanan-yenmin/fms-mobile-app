import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { ComplaintItem } from '../../types/complaint.types';
import { Card, StatusBadge, Button } from '../../components';
import { useTheme } from '../../context';
import {
  useAppDispatch,
  useAppSelector,
  fetchComplaintDetailThunk,
  submitComplaintFeedbackThunk,
  clearSelectedComplaint,
} from '../../store';

export interface ComplaintDetailModalProps {
  visible: boolean;
  complaint: ComplaintItem | null;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  visible,
  complaint,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { selectedComplaint, loadingDetail, submittingFeedback } = useAppSelector(
    (state) => state.complaints
  );

  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSavedBanner, setFeedbackSavedBanner] = useState(false);

  const activeTicket =
    selectedComplaint && complaint && selectedComplaint.id === complaint.id
      ? selectedComplaint
      : complaint;

  useEffect(() => {
    if (visible && complaint?.id) {
      setSelectedRating(complaint.rating || 0);
      setFeedbackText(complaint.feedbackComment || '');
      setFeedbackError(null);
      setFeedbackSavedBanner(false);
      dispatch(fetchComplaintDetailThunk(complaint.id));
    } else if (!visible) {
      dispatch(clearSelectedComplaint());
    }
  }, [visible, complaint?.id, dispatch]);

  useEffect(() => {
    if (activeTicket?.rating) {
      setSelectedRating(activeTicket.rating);
    }
    if (activeTicket?.feedbackComment) {
      setFeedbackText(activeTicket.feedbackComment);
    }
  }, [activeTicket?.rating, activeTicket?.feedbackComment]);

  if (!activeTicket) return null;

  const isCompletedState = ['Resolved', 'Verified', 'Closed'].includes(
    activeTicket.status
  );
  const alreadyRated = Boolean(activeTicket.rating && activeTicket.rating > 0);

  const locationParts = [
    activeTicket.campusName,
    activeTicket.buildingName,
    activeTicket.floorName,
    activeTicket.roomName,
  ].filter(Boolean);

  const handleSubmitFeedback = async () => {
    if (selectedRating < 1 || selectedRating > 5) {
      setFeedbackError('Please tap 1 to 5 stars to rate this service.');
      return;
    }

    setFeedbackError(null);
    const result = await dispatch(
      submitComplaintFeedbackThunk({
        complaintId: activeTicket.id,
        payload: {
          rating: selectedRating,
          comment: feedbackText.trim() || undefined,
        },
      })
    );

    if (submitComplaintFeedbackThunk.fulfilled.match(result)) {
      setFeedbackSavedBanner(true);
      dispatch(fetchComplaintDetailThunk(activeTicket.id));
    } else {
      setFeedbackError((result.payload as string) || 'Failed to save feedback');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' },
            ]}
          >
            <Feather name="arrow-left" size={19} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ticketNumHeader, { color: colors.primary }]}>
              {activeTicket.ticketNumber}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {activeTicket.category} • Reported {activeTicket.reportedAt}
            </Text>
          </View>
          <StatusBadge status={activeTicket.status} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Summary Card */}
          <Card>
            <View style={styles.badgesRow}>
              <StatusBadge status={activeTicket.priority} type="priority" />
              {activeTicket.slaBreached ? (
                <View style={styles.slaBreachPill}>
                  <Feather name="alert-triangle" size={11} color="#DC2626" />
                  <Text style={styles.slaBreachText}>SLA Breached</Text>
                </View>
              ) : activeTicket.slaDueAt ? (
                <View
                  style={[
                    styles.slaDuePill,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                  ]}
                >
                  <Feather name="clock" size={11} color={colors.textSecondary} />
                  <Text style={[styles.slaDueText, { color: colors.textSecondary }]}>
                    Due: {activeTicket.slaDueAt}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {activeTicket.title}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {activeTicket.description}
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            {/* Location & Asset */}
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {locationParts.join(' • ') || 'Campus Location'}
              </Text>
            </View>

            {activeTicket.assetName ? (
              <View style={styles.infoRow}>
                <Feather name="cpu" size={14} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Linked Equipment: {activeTicket.assetName}
                </Text>
              </View>
            ) : null}

            {activeTicket.assignedToName ? (
              <View
                style={[
                  styles.assignedBox,
                  { backgroundColor: isDark ? '#172554' : '#EFF6FF' },
                ]}
              >
                <Feather
                  name="user-check"
                  size={15}
                  color={isDark ? '#93C5FD' : '#1D4ED8'}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.assignedTitle,
                      { color: isDark ? '#BFDBFE' : '#1E40AF' },
                    ]}
                  >
                    Assigned Technician: {activeTicket.assignedToName}
                  </Text>
                  {activeTicket.assignedDepartment ? (
                    <Text
                      style={[
                        styles.assignedDept,
                        { color: isDark ? '#93C5FD' : '#3B82F6' },
                      ]}
                    >
                      Department: {activeTicket.assignedDepartment}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
          </Card>

          {/* Resolution Summary (if resolved) */}
          {activeTicket.resolutionNotes ? (
            <Card>
              <View style={styles.cardTitleRow}>
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Resolution Summary
                </Text>
              </View>
              <Text style={[styles.resolutionText, { color: colors.textSecondary }]}>
                {activeTicket.resolutionNotes}
              </Text>
              {activeTicket.resolvedAt ? (
                <Text style={[styles.metaHint, { color: colors.textMuted }]}>
                  Resolved on {activeTicket.resolvedAt}
                </Text>
              ) : null}
            </Card>
          ) : null}

          {/* CSAT Rating & Feedback */}
          {isCompletedState && (
            <Card>
              <View style={styles.cardTitleRow}>
                <Feather name="star" size={16} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {alreadyRated ? 'Your Service Rating' : 'Rate Service Resolution'}
                </Text>
              </View>

              {feedbackSavedBanner && (
                <View style={styles.feedbackSuccessBanner}>
                  <Feather name="check" size={14} color="#059669" />
                  <Text style={styles.feedbackSuccessText}>
                    Thank you! Your CSAT rating has been recorded.
                  </Text>
                </View>
              )}

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    disabled={alreadyRated || submittingFeedback}
                    onPress={() => setSelectedRating(star)}
                    style={styles.starBtn}
                  >
                    <Feather
                      name="star"
                      size={28}
                      color={selectedRating >= star ? '#F59E0B' : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {alreadyRated ? (
                activeTicket.feedbackComment ? (
                  <Text
                    style={[
                      styles.savedFeedbackComment,
                      { color: colors.textSecondary },
                    ]}
                  >
                    "{activeTicket.feedbackComment}"
                  </Text>
                ) : (
                  <Text style={[styles.metaHint, { color: colors.textMuted }]}>
                    Submitted {selectedRating}/5 stars
                  </Text>
                )
              ) : (
                <>
                  <TextInput
                    style={[
                      styles.feedbackInput,
                      {
                        borderColor: colors.border,
                        backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                        color: colors.text,
                      },
                    ]}
                    placeholder="Share optional feedback on speed & quality..."
                    placeholderTextColor={colors.textMuted}
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    multiline
                  />
                  {feedbackError && (
                    <Text style={styles.errorText}>{feedbackError}</Text>
                  )}
                  <Button
                    title="Submit Service Rating"
                    icon="send"
                    loading={submittingFeedback}
                    onPress={handleSubmitFeedback}
                    style={{ marginTop: 10 }}
                  />
                </>
              )}
            </Card>
          )}

          {/* Lifecycle Timeline */}
          <Card>
            <View style={styles.cardTitleRow}>
              <Feather name="git-commit" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Complaint Lifecycle Timeline
              </Text>
              {loadingDetail && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </View>

            {(!activeTicket.timeline || activeTicket.timeline.length === 0) ? (
              <Text style={[styles.metaHint, { color: colors.textMuted }]}>
                {loadingDetail
                  ? 'Loading timeline events...'
                  : 'Ticket submitted and awaiting facility review.'}
              </Text>
            ) : (
              <View style={styles.timelineList}>
                {activeTicket.timeline.map((event, idx) => {
                  const isLast = idx === (activeTicket.timeline?.length || 1) - 1;
                  return (
                    <View key={event.id} style={styles.timelineItem}>
                      <View style={styles.timelineTrack}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                        {!isLast && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: colors.border },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineBody}>
                        <View style={styles.timelineHeader}>
                          <Text
                            style={[styles.timelineTitle, { color: colors.text }]}
                          >
                            {event.title}
                          </Text>
                          <StatusBadge status={event.status} />
                        </View>
                        {event.description ? (
                          <Text
                            style={[
                              styles.timelineDesc,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {event.description}
                          </Text>
                        ) : null}
                        <Text
                          style={[styles.timelineMeta, { color: colors.textMuted }]}
                        >
                          By {event.performedBy} • {event.timestamp}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketNumHeader: {
    fontSize: 14,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  slaBreachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slaBreachText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  slaDuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slaDueText: {
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  assignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  assignedTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  assignedDept: {
    fontSize: 11,
    marginTop: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  resolutionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  metaHint: {
    fontSize: 11,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 6,
  },
  starBtn: {
    padding: 4,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 13,
    marginTop: 8,
  },
  savedFeedbackComment: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  feedbackSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '600',
  },
  timelineList: {
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineTrack: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 14,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  timelineDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  timelineMeta: {
    fontSize: 10,
    marginTop: 4,
  },
});

