import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  TrendingDown,
  Calculator,
  Info,
  Plus,
  Target,
  PiggyBank,
} from 'lucide-react-native'; 
import { useMirror } from '@/providers/MirrorProvider';
import IncomeProfile from '@/components/IncomeProfile';
import SavingsCard from '@/components/SavingsCard';
import { formatCurrency } from '@/utils/money';
import { calculateAverageMonthlyBills } from '@/utils/calculations';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    profile,
    bills,
    summary,
    estimatedMonthlyIncome,
    updateIncomeProfile,
    updateNotificationSettings,
    savings,
    totalSavings,
    totalSavingsTarget,
  } = useMirror();

  const averageBills = calculateAverageMonthlyBills(bills);

  const handleNotificationToggle = useCallback((value: boolean) => {
    updateNotificationSettings(value);
  }, [updateNotificationSettings]);

  const showBalanceInfo = useCallback(() => {
    Alert.alert(
      'Remaining Balance',
      'Your remaining balance is calculated by subtracting all scheduled bills from your monthly income. When you mark a bill as paid, the actual amount (if different) is used in the calculation.',
      [{ text: 'Got it' }]
    );
  }, []);

  const handleCreateSavings = useCallback(() => {
    router.push('/savings/create');
  }, [router]);

  const handleSavingsPress = useCallback((goalId: string) => {
    router.push(`/savings/${goalId}`);
  }, [router]);

  const savingsProgress = totalSavingsTarget > 0
    ? Math.min((totalSavings / totalSavingsTarget) * 100, 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID="profile-scroll"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income</Text>
        <IncomeProfile
          incomeProfile={profile.incomeProfile}
          estimatedMonthlyIncome={estimatedMonthlyIncome}
          onSave={updateIncomeProfile}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Summary</Text>
        
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.dangerLight }]}>
                <TrendingDown size={18} color={colors.danger} />
              </View>
              <Text style={styles.summaryLabel}>Total Bills</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalBillsScheduled)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.successLight }]}>
                <Calculator size={18} color={colors.success} />
              </View>
              <Text style={styles.summaryLabel}>Average Bills</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(averageBills)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={showBalanceInfo}
          activeOpacity={0.7}
        >
          <View style={styles.infoContent}>
            <Info size={18} color={colors.accent} />
            <Text style={styles.infoText}>
              How is my remaining balance calculated?
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: colors.warningLight }]}>
                <Bell size={18} color={colors.warning} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Bill Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified 14 and 3 days before bills are due
                </Text>
              </View>
            </View>
            <Switch
              value={profile.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={colors.surface}
              ios_backgroundColor={colors.border}
              testID="notification-toggle"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateSavings}
            testID="add-savings-button"
          >
            <Plus size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {savings.length > 0 ? (
          <>
            <View style={styles.savingsSummaryCard}>
              <View style={styles.savingsSummaryRow}>
                <View style={styles.savingsSummaryItem}>
                  <View style={[styles.iconBox, { backgroundColor: colors.successLight }]}>
                    <PiggyBank size={18} color={colors.success} />
                  </View>
                  <Text style={styles.summaryLabel}>Total Saved</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {formatCurrency(totalSavings)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.savingsSummaryItem}>
                  <View style={[styles.iconBox, { backgroundColor: colors.accentLight + '30' }]}>
                    <Target size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.summaryLabel}>Total Goals</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(totalSavingsTarget)}
                  </Text>
                </View>
              </View>
              <View style={styles.savingsProgressContainer}>
                <View style={styles.savingsProgressBar}>
                  <View
                    style={[
                      styles.savingsProgressFill,
                      { width: `${savingsProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.savingsProgressText}>
                  {savingsProgress.toFixed(0)}% of goals reached
                </Text>
              </View>
            </View>
            {savings.map((goal) => (
              <SavingsCard
                key={goal.id}
                goal={goal}
                onPress={() => handleSavingsPress(goal.id)}
              />
            ))}
          </>
        ) : (
          <TouchableOpacity
            style={styles.emptyState}
            onPress={handleCreateSavings}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.successLight }]}>
              <PiggyBank size={24} color={colors.success} />
            </View>
            <Text style={styles.emptyTitle}>Start Saving</Text>
            <Text style={styles.emptyDescription}>
              Create your first savings goal to track your progress
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Mirror helps you see what needs to be paid this month and what remains after your bills are covered.
          </Text>
          <Text style={styles.disclaimer}>
            Mirror is not a bank, financial advisor, or budgeting tool. It does not move money or access your accounts.
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  infoCard: {
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.subhead,
    color: colors.accent,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  settingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  settingDescription: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aboutText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  disclaimer: {
    ...typography.footnote,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsSummaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  savingsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsSummaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  savingsProgressContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  savingsProgressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  savingsProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  savingsProgressText: {
    ...typography.caption1,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptyDescription: {
    ...typography.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
