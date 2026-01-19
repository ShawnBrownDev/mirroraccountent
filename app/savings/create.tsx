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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMirror } from '@/providers/MirrorProvider';
import { parseCurrencyInput } from '@/utils/money';
import { SAVINGS_COLORS } from '@/types/savings';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const ICONS = [
  { id: 'piggy-bank', Icon: PiggyBank, label: 'Savings' },
  { id: 'home', Icon: Home, label: 'Home' },
  { id: 'car', Icon: Car, label: 'Car' },
  { id: 'plane', Icon: Plane, label: 'Travel' },
  { id: 'gift', Icon: Gift, label: 'Gift' },
  { id: 'heart', Icon: Heart, label: 'Health' },
  { id: 'graduation-cap', Icon: GraduationCap, label: 'Education' },
  { id: 'briefcase', Icon: Briefcase, label: 'Business' },
  { id: 'umbrella', Icon: Umbrella, label: 'Emergency' },
  { id: 'shield', Icon: Shield, label: 'Security' },
];

export default function CreateSavingsScreen() {
  const router = useRouter();
  const { addSavingsGoal } = useMirror();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('piggy-bank');
  const [selectedColor, setSelectedColor] = useState<string>(SAVINGS_COLORS[0]);

  const handleAmountChange = useCallback((text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setter(cleaned);
  }, []);

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

    const parsedCurrent = parseCurrencyInput(currentAmount) || 0;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    addSavingsGoal({
      name: name.trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      icon: selectedIcon,
      color: selectedColor,
    });

    router.back();
  }, [name, targetAmount, currentAmount, selectedIcon, selectedColor, addSavingsGoal, router]);

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
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Emergency Fund"
            placeholderTextColor={colors.textTertiary}
            autoFocus
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
          <Text style={styles.label}>Current Savings (Optional)</Text>
          <View style={styles.inputWithIcon}>
            <DollarSign size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.iconInput}
              value={currentAmount}
              onChangeText={(t) => handleAmountChange(t, setCurrentAmount)}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              testID="savings-current-input"
            />
          </View>
          <Text style={styles.hint}>
            Enter how much you have already saved toward this goal
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map(({ id, Icon }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.iconOption,
                  selectedIcon === id && { borderColor: selectedColor, borderWidth: 2 },
                ]}
                onPress={() => setSelectedIcon(id)}
              >
                <Icon
                  size={24}
                  color={selectedIcon === id ? selectedColor : colors.textSecondary}
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
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Check size={18} color={colors.textInverse} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
          style={[styles.saveButton, { backgroundColor: selectedColor }]}
          onPress={handleSave}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>Create Goal</Text>
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
  hint: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
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