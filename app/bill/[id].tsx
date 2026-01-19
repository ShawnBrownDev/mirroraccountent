import React, { useState, useCallback, useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, DollarSign, Bell, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMirror } from '@/providers/MirrorProvider';
import { parseCurrencyInput, formatCurrencyInput } from '@/utils/money';
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

export default function EditBillScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bills, updateBill, deleteBill } = useMirror();

  const bill = useMemo(() => bills.find((b) => b.id === id), [bills, id]);

  const [name, setName] = useState(bill?.name ?? '');
  const [amount, setAmount] = useState(
    bill ? formatCurrencyInput(bill.expectedAmount) : ''
  );
  const [dueDay, setDueDay] = useState(bill?.dueDay.toString() ?? '1');
  const [category, setCategory] = useState<string | undefined>(bill?.category);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    bill?.notificationsEnabled ?? true
  );

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
    if (!id) return;

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

    updateBill(id, {
      name: name.trim(),
      expectedAmount: parsedAmount,
      dueDay: parsedDueDay,
      category,
      notificationsEnabled,
    });

    router.back();
  }, [id, name, amount, dueDay, category, notificationsEnabled, updateBill, router]);

  const handleDelete = useCallback(() => {
    if (!id) return;

    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${bill?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteBill(id);
            router.back();
          },
        },
      ]
    );
  }, [id, bill?.name, deleteBill, router]);

  if (!bill) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Bill not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          testID="delete-button"
        >
          <Trash2 size={20} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Bill</Text>
        </TouchableOpacity>
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
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  notFoundText: {
    ...typography.title2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    ...typography.headline,
    color: colors.textInverse,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dangerLight,
  },
  deleteButtonText: {
    ...typography.headline,
    color: colors.danger,
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
