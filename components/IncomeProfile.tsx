import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DollarSign,
  Check,
  Briefcase,
  TrendingUp,
  Calendar,
  ChevronDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  IncomeProfile as IncomeProfileType,
  IncomeMode,
  PayFrequency,
  FixedIncome,
  VariableIncome,
  FREQUENCY_LABELS,
  FREQUENCY_MULTIPLIERS,
} from '@/types/income';
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/utils/money';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface IncomeProfileProps {
  incomeProfile?: IncomeProfileType;
  estimatedMonthlyIncome: number;
  onSave: (profile: IncomeProfileType) => void;
}

const FREQUENCIES: PayFrequency[] = ['weekly', 'biweekly', 'monthly'];

export default function IncomeProfile({
  incomeProfile,
  estimatedMonthlyIncome,
  onSave,
}: IncomeProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<IncomeMode>(incomeProfile?.mode ?? 'fixed');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const [fixedAmount, setFixedAmount] = useState('');
  const [frequency, setFrequency] = useState<PayFrequency>('monthly');
  
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (incomeProfile) {
      if (incomeProfile.mode === 'fixed') {
        setFixedAmount(formatCurrencyInput(incomeProfile.amount));
        setFrequency(incomeProfile.frequency);
      } else {
        setMinAmount(formatCurrencyInput(incomeProfile.minAmount));
        setMaxAmount(formatCurrencyInput(incomeProfile.maxAmount));
        setNotes(incomeProfile.notes ?? '');
      }
      setMode(incomeProfile.mode);
    }
  }, [incomeProfile]);

  const handleStartEditing = useCallback(() => {
    console.log('[IncomeProfile] Starting edit mode');
    setIsEditing(true);
    setValidationError(null);
  }, []);

  const handleAmountChange = useCallback((text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setter(cleaned);
    setValidationError(null);
  }, []);

  const validate = useCallback((): boolean => {
    if (mode === 'fixed') {
      const amount = parseCurrencyInput(fixedAmount);
      if (amount <= 0) {
        setValidationError('Please enter a valid income amount');
        return false;
      }
    } else {
      const min = parseCurrencyInput(minAmount);
      const max = parseCurrencyInput(maxAmount);
      if (min <= 0 || max <= 0) {
        setValidationError('Please enter valid minimum and maximum amounts');
        return false;
      }
      if (min > max) {
        setValidationError('Minimum cannot exceed maximum');
        return false;
      }
    }
    return true;
  }, [mode, fixedAmount, minAmount, maxAmount]);

  const handleSave = useCallback(() => {
    console.log('[IncomeProfile] Attempting to save');
    
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === 'fixed') {
      const profile: FixedIncome = {
        mode: 'fixed',
        amount: parseCurrencyInput(fixedAmount),
        frequency,
      };
      console.log('[IncomeProfile] Saving fixed income:', profile);
      onSave(profile);
    } else {
      const profile: VariableIncome = {
        mode: 'variable',
        minAmount: parseCurrencyInput(minAmount),
        maxAmount: parseCurrencyInput(maxAmount),
        notes: notes.trim() || undefined,
      };
      console.log('[IncomeProfile] Saving variable income:', profile);
      onSave(profile);
    }

    setIsEditing(false);
  }, [mode, fixedAmount, frequency, minAmount, maxAmount, notes, validate, onSave]);

  const handleModeSwitch = useCallback((newMode: IncomeMode) => {
    console.log('[IncomeProfile] Switching mode to:', newMode);
    Haptics.selectionAsync();
    setMode(newMode);
    setValidationError(null);
  }, []);

  const handleFrequencySelect = useCallback((freq: PayFrequency) => {
    console.log('[IncomeProfile] Selected frequency:', freq);
    Haptics.selectionAsync();
    setFrequency(freq);
    setShowFrequencyPicker(false);
  }, []);

  const calculatePreview = useCallback((): number => {
    if (mode === 'fixed') {
      const amount = parseCurrencyInput(fixedAmount);
      return amount * FREQUENCY_MULTIPLIERS[frequency];
    } else {
      return parseCurrencyInput(minAmount);
    }
  }, [mode, fixedAmount, frequency, minAmount]);

  const getSubtext = useCallback((): string => {
    if (!incomeProfile) return 'Tap to set up your income';
    if (incomeProfile.mode === 'fixed') {
      return `${FREQUENCY_LABELS[incomeProfile.frequency]} • ${formatCurrency(incomeProfile.amount)}`;
    }
    return `Variable • ${formatCurrency(incomeProfile.minAmount)} – ${formatCurrency(incomeProfile.maxAmount)}`;
  }, [incomeProfile]);

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.editCard}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'fixed' && styles.modeButtonActive]}
              onPress={() => handleModeSwitch('fixed')}
              testID="mode-fixed-button"
            >
              <Briefcase size={16} color={mode === 'fixed' ? colors.textInverse : colors.textSecondary} />
              <Text style={[styles.modeButtonText, mode === 'fixed' && styles.modeButtonTextActive]}>
                Fixed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'variable' && styles.modeButtonActive]}
              onPress={() => handleModeSwitch('variable')}
              testID="mode-variable-button"
            >
              <TrendingUp size={16} color={mode === 'variable' ? colors.textInverse : colors.textSecondary} />
              <Text style={[styles.modeButtonText, mode === 'variable' && styles.modeButtonTextActive]}>
                Variable
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'fixed' ? (
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Pay Amount</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={fixedAmount}
                  onChangeText={(text) => handleAmountChange(text, setFixedAmount)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  testID="fixed-amount-input"
                />
              </View>

              <Text style={styles.inputLabel}>Pay Frequency</Text>
              <TouchableOpacity
                style={styles.frequencySelector}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
                testID="frequency-selector"
              >
                <Calendar size={18} color={colors.textSecondary} />
                <Text style={styles.frequencyText}>{FREQUENCY_LABELS[frequency]}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {showFrequencyPicker && (
                <View style={styles.frequencyPicker}>
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[styles.frequencyOption, frequency === freq && styles.frequencyOptionActive]}
                      onPress={() => handleFrequencySelect(freq)}
                    >
                      <Text style={[styles.frequencyOptionText, frequency === freq && styles.frequencyOptionTextActive]}>
                        {FREQUENCY_LABELS[freq]}
                      </Text>
                      {frequency === freq && <Check size={16} color={colors.accent} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Typical Monthly Range</Text>
              <View style={styles.rangeInputs}>
                <View style={styles.rangeInputWrapper}>
                  <Text style={styles.rangeLabel}>Min</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={minAmount}
                      onChangeText={(text) => handleAmountChange(text, setMinAmount)}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.textTertiary}
                      testID="min-amount-input"
                    />
                  </View>
                </View>
                <View style={styles.rangeDivider}>
                  <Text style={styles.rangeDividerText}>to</Text>
                </View>
                <View style={styles.rangeInputWrapper}>
                  <Text style={styles.rangeLabel}>Max</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={maxAmount}
                      onChangeText={(text) => handleAmountChange(text, setMaxAmount)}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.textTertiary}
                      testID="max-amount-input"
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., Tips, freelance work, commissions"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={2}
                testID="notes-input"
              />
            </View>
          )}

          {validationError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {(parseCurrencyInput(fixedAmount) > 0 || parseCurrencyInput(minAmount) > 0) && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Estimated Monthly Income</Text>
              <Text style={styles.previewValue}>{formatCurrency(calculatePreview())}</Text>
              <Text style={styles.previewHint}>
                {mode === 'fixed' 
                  ? 'Based on how you\'re paid' 
                  : 'Using minimum for conservative estimate'}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
              testID="cancel-button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              testID="save-button"
            >
              <Check size={18} color={colors.textInverse} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleStartEditing}
      activeOpacity={0.7}
      testID="income-profile-display"
    >
      <View style={styles.displayCard}>
        <View style={styles.displayHeader}>
          <View style={styles.iconContainer}>
            <DollarSign size={22} color={colors.accent} />
          </View>
          <View style={styles.displayInfo}>
            <Text style={styles.displayLabel}>Estimated Monthly Income</Text>
            <Text style={styles.displayValue}>
              {estimatedMonthlyIncome > 0 ? formatCurrency(estimatedMonthlyIncome) : 'Tap to set up'}
            </Text>
          </View>
        </View>
        {incomeProfile && (
          <View style={styles.displayFooter}>
            <View style={styles.badge}>
              {incomeProfile.mode === 'fixed' ? (
                <Briefcase size={12} color={colors.accent} />
              ) : (
                <TrendingUp size={12} color={colors.accent} />
              )}
              <Text style={styles.badgeText}>
                {incomeProfile.mode === 'fixed' ? 'Fixed Income' : 'Variable Income'}
              </Text>
            </View>
            <Text style={styles.displaySubtext}>{getSubtext()}</Text>
          </View>
        )}
        {!incomeProfile && (
          <Text style={styles.setupHint}>
            Enter your typical income to see your Remaining Balance
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  displayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  displayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  displayLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  displayValue: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  displayFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  badgeText: {
    ...typography.caption1,
    color: colors.accent,
    fontWeight: '500' as const,
  },
  displaySubtext: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  setupHint: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  editCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: 3,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm - 2,
    gap: spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
  },
  modeButtonText: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  modeButtonTextActive: {
    color: colors.textInverse,
  },
  formSection: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencySymbol: {
    ...typography.title3,
    color: colors.textTertiary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.title3,
    color: colors.textPrimary,
    padding: 0,
  },
  frequencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  frequencyText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  frequencyPicker: {
    marginTop: spacing.xs,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  frequencyOptionActive: {
    backgroundColor: colors.surface,
  },
  frequencyOptionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  frequencyOptionTextActive: {
    color: colors.textPrimary,
    fontWeight: '500' as const,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  rangeInputWrapper: {
    flex: 1,
  },
  rangeLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  rangeDivider: {
    paddingBottom: spacing.md,
  },
  rangeDividerText: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  notesInput: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorContainer: {
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.footnote,
    color: colors.danger,
    textAlign: 'center',
  },
  previewContainer: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  previewLabel: {
    ...typography.footnote,
    color: colors.success,
    marginBottom: 2,
  },
  previewValue: {
    ...typography.title2,
    color: colors.success,
  },
  previewHint: {
    ...typography.caption1,
    color: colors.success,
    opacity: 0.8,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600' as const,
  },
});
