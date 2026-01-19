import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DollarSign, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMirror } from '@/providers/MirrorProvider';
import { parseCurrencyInput } from '@/utils/money';
import { formatDayOfMonth } from '@/utils/date';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const CATEGORIES = [
  'Rent',
  'Utilities',
  'Insurance',
  'Subscription',
  'Loan',
  'Credit Card',
  'Phone',
  'Internet',
  'Other',
];

export default function CreateBillScreen() {
  const router = useRouter();
  const { addBill } = useMirror();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [category, setCategory] = useState<string | undefined>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleAmountChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  }, []);

  const handleDueDayChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    if (cleaned === '' || (num >= 1 && num <= 31)) {
      setDueDay(cleaned);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this bill.');
      return;
    }

    const parsedAmount = parseCurrencyInput(amount);
    if (parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const parsedDueDay = parseInt(dueDay, 10);
    if (isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      Alert.alert('Invalid Due Day', 'Please enter a day between 1 and 31.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    addBill({
      name: name.trim(),
      expectedAmount: parsedAmount,
      dueDay: parsedDueDay,
      frequency: 'monthly',
      category,
      notificationsEnabled,
    });

    router.back();
  }, [name, amount, dueDay, category, notificationsEnabled, addBill, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bill Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Electric Bill"
            placeholderTextColor={colors.textTertiary}
            autoFocus
            testID="bill-name-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputWithIcon}>
            <DollarSign size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.iconInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              testID="bill-amount-input"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Day of Month</Text>
          <View style={styles.inputWithIcon}>
            <Calendar size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.iconInput}
              value={dueDay}
              onChangeText={handleDueDayChange}
              placeholder="1"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              testID="bill-due-day-input"
            />
            {dueDay && (
              <Text style={styles.dueDayHint}>
                {formatDayOfMonth(parseInt(dueDay, 10) || 1)} of each month
              </Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category (Optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(category === cat ? undefined : cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            activeOpacity={0.7}
          >
            <View style={styles.toggleInfo}>
              <View style={[styles.iconBox, { backgroundColor: colors.warningLight }]}>
                <Bell size={18} color={colors.warning} />
              </View>
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Reminders</Text>
                <Text style={styles.toggleDescription}>
                  14 and 3 days before due date
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                notificationsEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  notificationsEnabled && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>Add Bill</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  dueDayHint: {
    ...typography.footnote,
    color: colors.textTertiary,
  },
  categoryScroll: {
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChipText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: colors.textInverse,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    marginLeft: spacing.md,
  },
  toggleTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  toggleDescription: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.textInverse,
  },
});