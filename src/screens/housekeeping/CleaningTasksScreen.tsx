import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_CLEANING_TASKS } from '../../mocks/mockData';
import { CleaningTask } from '../../types';
import { Card, Button, StatusBadge } from '../../components';
import { useTheme } from '../../context';

export const CleaningTasksScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [tasks, setTasks] = useState<CleaningTask[]>(MOCK_CLEANING_TASKS);

  const toggleTaskCheck = (taskId: string, checkId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedList = t.checklist.map((c) =>
          c.id === checkId ? { ...c, done: !c.done } : c
        );
        const allDone = updatedList.every((c) => c.done);
        return {
          ...t,
          checklist: updatedList,
          status: allDone ? 'Completed' : 'In Progress',
        };
      })
    );
  };

  const uploadProofPhoto = (taskId: string) => {
    Alert.alert(
      'Cleanliness Proof',
      'Camera activated. Finished room hygiene photo captured successfully.',
      [
        {
          text: 'Save',
          onPress: () => {
            setTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, photoUploaded: true, status: 'Completed' } : t))
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Today's Cleaning Schedule</Text>
            <Text style={[styles.summarySub, { color: colors.textSecondary }]}>Shift A • Academic Block A & Labs</Text>
          </View>
          <View
            style={[
              styles.progressBadge,
              {
                backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                borderColor: isDark ? '#065F46' : '#A7F3D0',
              },
            ]}
          >
            <Text
              style={[
                styles.progressNum,
                { color: isDark ? '#6EE7B7' : '#065F46' },
              ]}
            >
              {tasks.filter((t) => t.status === 'Completed').length}/{tasks.length} Done
            </Text>
          </View>
        </View>
      </Card>

      {tasks.map((task) => (
        <Card key={task.id} style={styles.card}>
          <View style={styles.taskHeader}>
            <View>
              <Text style={[styles.roomName, { color: colors.text }]}>{task.roomName}</Text>
              <Text style={[styles.roomLocation, { color: colors.textSecondary }]}>
                {task.building} • {task.floor} ({task.roomType})
              </Text>
            </View>
            <StatusBadge status={task.status} />
          </View>

          <View
            style={[
              styles.timeBadge,
              { backgroundColor: isDark ? '#1A2333' : colors.background },
            ]}
          >
            <Feather name="clock" size={12} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{task.scheduledTime}</Text>
          </View>

          <Text style={[styles.checklistTitle, { color: colors.text }]}>Sanitation Checklist Items:</Text>
          {task.checklist.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.checkRow}
              onPress={() => toggleTaskCheck(task.id, c.id)}
            >
              <Feather
                name={c.done ? 'check-circle' : 'circle'}
                size={18}
                color={c.done ? '#10B981' : colors.textMuted}
              />
              <Text
                style={[
                  styles.checkLabel,
                  { color: colors.text },
                  c.done && { textDecorationLine: 'line-through', color: colors.textMuted },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[
                styles.proofBtn,
                {
                  backgroundColor: task.photoUploaded
                    ? isDark ? '#064E3B' : '#ECFDF5'
                    : isDark ? '#1A2333' : colors.background,
                  borderColor: task.photoUploaded
                    ? isDark ? '#065F46' : '#A7F3D0'
                    : colors.border,
                },
              ]}
              onPress={() => uploadProofPhoto(task.id)}
            >
              <Feather
                name={task.photoUploaded ? 'check' : 'camera'}
                size={14}
                color={task.photoUploaded ? (isDark ? '#6EE7B7' : '#065F46') : colors.text}
              />
              <Text
                style={[
                  styles.proofText,
                  {
                    color: task.photoUploaded
                      ? isDark ? '#6EE7B7' : '#065F46'
                      : colors.text,
                  },
                ]}
              >
                {task.photoUploaded ? 'Photo Uploaded' : 'Upload Proof Photo'}
              </Text>
            </TouchableOpacity>

            {task.status !== 'Completed' && (
              <Button
                title="Mark Completed"
                size="sm"
                onPress={() => {
                  setTasks((prev) =>
                    prev.map((t) => (t.id === task.id ? { ...t, status: 'Completed' } : t))
                  );
                  Alert.alert('Task Done', `${task.roomName} marked completed.`);
                }}
              />
            )}
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
  summaryCard: {
    padding: 14,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  summarySub: {
    fontSize: 11,
    marginTop: 2,
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressNum: {
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '800',
  },
  roomLocation: {
    fontSize: 11,
    marginTop: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 11,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkLabel: {
    fontSize: 12,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 10,
  },
  proofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  proofText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

