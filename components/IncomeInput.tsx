import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { DollarSign, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/utils/money';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface IncomeInputProps {
  value: number;
  onSave: (value: number) => void;
}

export default function IncomeInput({ value, onSave }: IncomeInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(formatCurrencyInput(value));

  const handlePress = useCallback(() => {
    setIsEditing(true);
    setInputValue(value > 0 ? formatCurrencyInput(value) : '');
  }, [value]);

  const handleSave = useCallback(() => {
    const parsed = parseCurrencyInput(inputValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(parsed);
    setIsEditing(false);
  }, [inputValue, onSave]);

  const handleChangeText = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setInputValue(cleaned);
  }, []);

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.editContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={handleChangeText}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              selectTextOnFocus
              testID="income-input"
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            testID="income-save-button"
          >
            <Check size={20} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Enter your monthly take-home pay</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      testID="income-display"
    >
      <View style={styles.displayContainer}>
        <View style={styles.iconContainer}>
          <DollarSign size={20} color={colors.accent} />
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Monthly Income</Text>
          <Text style={styles.value}>
            {value > 0 ? formatCurrency(value) : 'Tap to set'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  displayContainer: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  label: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  value: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: 2,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencySymbol: {
    ...typography.title2,
    color: colors.textTertiary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.title2,
    color: colors.textPrimary,
    padding: 0,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  hint: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
});
