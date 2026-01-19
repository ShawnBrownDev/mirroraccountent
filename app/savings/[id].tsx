import React, { useState, useCallback, useEffect } from 'react';
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
import {
  PiggyBank,
  Home,
  Car,
  Plane,
  Gift,
  Heart,
  GraduationCap,
  Briefcase,
  Umbrella,
  Shield,
  DollarSign,
  Check,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMirror } from '@/providers/MirrorProvider';
import { formatCurrency, parseCurrencyInput } from '@/utils/money';
import { SAVINGS_COLORS } from '@/types/savings';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const ICONS = [
  { id: 'piggy-bank', Icon: PiggyBank },
  { id: 'home', Icon: Home },
  { id: 'car', Icon: Car },
  { id: 'plane', Icon: Plane },
  { id: 'gift', Icon: Gift },
  { id: 'heart', Icon: Heart },
  { id: 'graduation-cap', Icon: GraduationCap },
  { id: 'briefcase', Icon: Briefcase },
  { id: 'umbrella', Icon: Umbrella },
  { id: 'shield', Icon: Shield },
];

export default function EditSavingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savings, updateSavingsGoal, deleteSavingsGoal, addToSavings } = useMirror();

  const goal = savings.find((g) => g.id === id);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('piggy-bank');
  const [selectedColor, setSelectedColor] = useState<string>(SAVINGS_COLORS[0]);
  const [addAmount, setAddAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setSelectedIcon(goal.icon || 'piggy-bank');
      setSelectedColor(goal.color || SAVINGS_COLORS[0]);
    }
  }, [goal]);

  const handleAmountChange = useCallback((text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setter(cleaned);
  }, []);

  const handleAddFunds = useCallback(() => {
    const amount = parseCurrencyInput(addAmount);
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to add.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToSavings(id!, amount);
    setAddAmount('');
    setShowAddFunds(false);
  }, [addAmount, id, addToSavings]);

  const handleWithdraw = useCallback(() => {
    const amount = parseCurrencyInput(addAmount);
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to withdraw.');
      return;
    }

    if (goal && amount > goal.currentAmount) {
      Alert.alert('Insufficient Funds', "You can't withdraw more than your current savings.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToSavings(id!, -amount);
    setAddAmount('');
    setShowAddFunds(false);
  }, [addAmount, id, goal, addToSavings]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this goal.');
      return;
    }

    const parsedTarget = parseCurrencyInput(targetAmount);
    if (parsedTarget <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target amount.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    updateSavingsGoal(id!, {
      name: name.trim(),
      targetAmount: parsedTarget,
      icon: selectedIcon,
      color: selectedColor,
    });

    router.back();
  }, [name, targetAmount, selectedIcon, selectedColor, id, updateSavingsGoal, router]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this savings goal? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteSavingsGoal(id!);
            router.back();
          },
        },
      ]
    );
  }, [id, deleteSavingsGoal, router]);

  if (!goal) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Goal not found</Text>
      </View>
    );
  }

  const progress = goal.targetAmount > 0 
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

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
        <View style={[styles.progressCard, { borderLeftColor: selectedColor }]}>
          <Text style={styles.progressLabel}>Current Progress</Text>
          <Text style={[styles.progressAmount, { color: selectedColor }]}>
            {formatCurrency(goal.currentAmount)}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: selectedColor },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
          </View>
          <Text style={styles.progressRemaining}>
            {formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))} remaining
          </Text>

          <TouchableOpacity
            style={[styles.addFundsButton, { backgroundColor: `${selectedColor}15` }]}
            onPress={() => setShowAddFunds(!showAddFunds)}
          >
            <Plus size={18} color={selectedColor} />
            <Text style={[styles.addFundsText, { color: selectedColor }]}>
              Add or Withdraw Funds
            </Text>
          </TouchableOpacity>

          {showAddFunds && (
            <View style={styles.addFundsSection}>
              <View style={styles.inputWithIcon}>
                <DollarSign size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.iconInput}
                  value={addAmount}
                  onChangeText={(t) => handleAmountChange(t, setAddAmount)}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  testID="add-amount-input"
                />
              </View>
              <View style={styles.fundButtons}>
                <TouchableOpacity
                  style={[styles.fundButton, { backgroundColor: colors.dangerLight }]}
                  onPress={handleWithdraw}
                >
                  <Minus size={16} color={colors.danger} />
                  <Text style={[styles.fundButtonText, { color: colors.danger }]}>Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fundButton, { backgroundColor: colors.successLight }]}
                  onPress={handleAddFunds}
                >
                  <Plus size={16} color={colors.success} />
                  <Text style={[styles.fundButtonText, { color: colors.success }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Emergency Fund"
            placeholderTextColor={colors.textTertiary}
            testID="savings-name-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Amount</Text>
          <View style={styles.inputWithIcon}>
            <DollarSign size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.iconInput}
              value={targetAmount}
              onChangeText={(t) => handleAmountChange(t, setTargetAmount)}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              testID="savings-target-input"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map(({ id: iconId, Icon }) => (
              <TouchableOpacity
                key={iconId}
                style={[
                  styles.iconOption,
                  selectedIcon === iconId && { borderColor: selectedColor, borderWidth: 2 },
                ]}
                onPress={() => setSelectedIcon(iconId)}
              >
                <Icon
                  size={24}
                  color={selectedIcon === iconId ? selectedColor : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {SAVINGS_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Check size={18} color={colors.textInverse} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          testID="delete-button"
        >
          <Trash2 size={18} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Goal</Text>
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
          style={[styles.saveButton, { backgroundColor: selectedColor }]}
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  progressLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressAmount: {
    ...typography.title1,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressPercent: {
    ...typography.footnote,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  progressRemaining: {
    ...typography.footnote,
    color: colors.textTertiary,
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  addFundsText: {
    ...typography.subhead,
    fontWeight: '600' as const,
  },
  addFundsSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  fundButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fundButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  fundButtonText: {
    ...typography.subhead,
    fontWeight: '600' as const,
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
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
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.textInverse,
  },
});