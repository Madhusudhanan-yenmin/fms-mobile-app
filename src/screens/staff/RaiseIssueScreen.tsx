import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PriorityLevel } from '../../types';
import { Card, Button } from '../../components';
import { useTheme } from '../../context';

interface RaiseIssueScreenProps {
  onSuccess: () => void;
}

export const RaiseIssueScreen: React.FC<RaiseIssueScreenProps> = ({ onSuccess }) => {
  const { colors, isDark } = useTheme();
  const [category, setCategory] = useState('Electrical & Power');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [room, setRoom] = useState('Lecture Hall 101');
  const [photoCaptured, setPhotoCaptured] = useState(false);

  const categories = [
    'Electrical & Power',
    'IT & AV Equipment',
    'Air Conditioning / HVAC',
    'Plumbing & Water',
    'Furniture & Carpentry',
    'Sanitation & Hygiene',
  ];

  const priorities: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a brief complaint title.');
      return;
    }

    Alert.alert(
      'Complaint Logged Successfully',
      `Ticket #TKT-2026-${Math.floor(1000 + Math.random() * 9000)} has been registered and routed to the Facility Management lead.`,
      [
        {
          text: 'View My Requests',
          onPress: onSuccess,
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <Text style={[styles.label, { color: colors.text }]}>Location / Classroom</Text>
        <View
          style={[
            styles.inputWrap,
            {
              borderColor: colors.border,
              backgroundColor: isDark ? '#1A2333' : colors.surface,
            },
          ]}
        >
          <Feather name="map-pin" size={16} color={colors.primary} />
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={room}
            onChangeText={setRoom}
            placeholder="e.g. Block A, First Floor, Room 204"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Issue Category</Text>
        <View style={styles.pillsWrap}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                {
                  borderColor: category === cat ? colors.primary : colors.border,
                  backgroundColor: category === cat
                    ? (isDark ? colors.primaryLight : colors.primaryLight)
                    : (isDark ? '#1A2333' : colors.surface),
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: category === cat ? colors.primary : colors.textSecondary },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Complaint Title *</Text>
        <TextInput
          style={[
            styles.textInputFlat,
            {
              borderColor: colors.border,
              backgroundColor: isDark ? '#1A2333' : colors.surface,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Tube light blinking, Water tap leaking..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Detailed Description</Text>
        <TextInput
          style={[
            styles.textInputFlat,
            {
              height: 80,
              textAlignVertical: 'top',
              borderColor: colors.border,
              backgroundColor: isDark ? '#1A2333' : colors.surface,
              color: colors.text,
            },
          ]}
          placeholder="Describe the breakdown, noise, or symptom observed..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Priority Severity</Text>
        <View style={styles.priorityRow}>
          {priorities.map((p) => {
            const isActive = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary : (isDark ? '#1A2333' : colors.surface),
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: isActive ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Attach Breakdown Photo</Text>
        <TouchableOpacity
          style={[
            styles.photoBox,
            {
              borderColor: photoCaptured ? '#10B981' : colors.border,
              backgroundColor: photoCaptured
                ? (isDark ? '#064E3B' : '#ECFDF5')
                : (isDark ? '#1A2333' : colors.background),
            },
          ]}
          onPress={() => {
            Alert.alert('Camera', 'Photo captured and attached.');
            setPhotoCaptured(true);
          }}
        >
          <Feather
            name={photoCaptured ? 'check-circle' : 'camera'}
            size={24}
            color={photoCaptured ? '#10B981' : colors.primary}
          />
          <Text style={[styles.photoBoxText, { color: colors.text }]}>
            {photoCaptured ? 'Photo Attached (IMG_2026.jpg)' : 'Take Photo with Camera'}
          </Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Submit Complaint Ticket"
        icon="send"
        size="lg"
        onPress={handleSubmit}
        style={{ marginTop: 4, marginBottom: 20 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
  },
  textInputFlat: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  photoBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoBoxText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

