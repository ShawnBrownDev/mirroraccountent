import IncomeProfile from '@/components/IncomeProfile';
import SavingsCard from '@/components/SavingsCard';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { useMirror } from '@/providers/MirrorProvider';
import { calculateAverageMonthlyBills } from '@/utils/calculations';
import { formatCurrency } from '@/utils/money';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  Calculator,
  ChevronRight,
  HelpCircle,
  PiggyBank,
  Plus,
  Shield,
  TrendingDown,
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Income</Text>
        </View>
        <IncomeProfile
          incomeProfile={profile.incomeProfile}
          estimatedMonthlyIncome={estimatedMonthlyIncome}
          onSave={updateIncomeProfile}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.dangerMuted }]}>
                <TrendingDown size={18} color={colors.danger} strokeWidth={2} />
              </View>
              <Text style={styles.summaryLabel}>Total Bills</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalBillsScheduled)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.accentMuted }]}>
                <Calculator size={18} color={colors.accent} strokeWidth={2} />
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
          <View style={styles.infoIconContainer}>
            <HelpCircle size={18} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.infoText}>
            How is my remaining balance calculated?
          </Text>
          <ChevronRight size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateSavings}
            activeOpacity={0.7}
            testID="add-savings-button"
          >
            <Plus size={18} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {savings.length > 0 ? (
          <>
            <LinearGradient
              colors={[colors.success, '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.savingsSummaryCard}
            >
              <View style={styles.savingsSummaryContent}>
                <View style={styles.savingsSummaryLeft}>
                  <View style={styles.savingsIconContainer}>
                    <PiggyBank size={24} color={colors.textInverse} strokeWidth={1.5} />
                  </View>
                  <View>
                    <Text style={styles.savingsTotalLabel}>Total Saved</Text>
                    <Text style={styles.savingsTotalValue}>
                      {formatCurrency(totalSavings)}
                    </Text>
                  </View>
                </View>
                <View style={styles.savingsSummaryRight}>
                  <Text style={styles.savingsGoalLabel}>of {formatCurrency(totalSavingsTarget)}</Text>
                  <View style={styles.savingsProgressBar}>
                    <View
                      style={[
                        styles.savingsProgressFill,
                        { width: `${savingsProgress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.savingsProgressText}>
                    {savingsProgress.toFixed(0)}% complete
                  </Text>
                </View>
              </View>
            </LinearGradient>
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
            <View style={styles.emptyIconContainer}>
              <PiggyBank size={28} color={colors.success} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Start Saving</Text>
            <Text style={styles.emptyDescription}>
              Create your first savings goal to track your progress toward financial milestones
            </Text>
            <View style={styles.emptyButton}>
              <Plus size={16} color={colors.textInverse} strokeWidth={2.5} />
              <Text style={styles.emptyButtonText}>Add Goal</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: colors.warningMuted }]}>
                <Bell size={18} color={colors.warning} strokeWidth={2} />
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
          <Text style={styles.sectionTitle}>About Mirror</Text>
        </View>
        
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIconContainer}>
              <Shield size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.aboutHeaderText}>Privacy First</Text>
          </View>
          <Text style={styles.aboutText}>
            Mirror helps you see what needs to be paid this month and what remains after your bills are covered.
          </Text>
          <View style={styles.aboutDivider} />
          <Text style={styles.disclaimer}>
            Mirror is not a bank, financial advisor, or budgeting tool. It does not move money or access your accounts. Your data stays on your device.
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.footnoteMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
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
    height: 64,
    backgroundColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  summaryValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoText: {
    ...typography.subhead,
    color: colors.textPrimary,
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsSummaryCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.large,
  },
  savingsSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  savingsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsTotalLabel: {
    ...typography.footnote,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xxs,
  },
  savingsTotalValue: {
    ...typography.title2,
    color: colors.textInverse,
  },
  savingsSummaryRight: {
    alignItems: 'flex-end',
  },
  savingsGoalLabel: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  savingsProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  savingsProgressFill: {
    height: '100%',
    backgroundColor: colors.textInverse,
    borderRadius: borderRadius.full,
  },
  savingsProgressText: {
    ...typography.caption2,
    color: 'rgba(255,255,255,0.8)',
  },
  settingsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
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
    marginTop: spacing.xxs,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aboutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  aboutHeaderText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  aboutText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  disclaimer: {
    ...typography.footnote,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  emptyState: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.medium,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.colored(colors.success),
  },
  emptyButtonText: {
    ...typography.subheadMedium,
    color: colors.textInverse,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});