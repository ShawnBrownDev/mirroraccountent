import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import { MonthlySummary as MonthlySummaryType } from '@/types/user';
import { formatCurrency } from '@/utils/money';
import { getMonthName } from '@/utils/date';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

export default function MonthlySummary({ summary }: MonthlySummaryProps) {
  const isPositive = summary.remainingBalance >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthLabel}>{getMonthName(summary.month)}</Text>
        <Text style={styles.yearLabel}>{summary.year}</Text>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Wallet size={20} color={colors.textInverse} />
          <Text style={styles.balanceLabel}>Remaining Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {formatCurrency(Math.abs(summary.remainingBalance))}
        </Text>
        {!isPositive && (
          <Text style={styles.negativeNote}>over budget</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
            <TrendingUp size={16} color={colors.success} />
          </View>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>{formatCurrency(summary.totalIncome)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.dangerLight }]}>
            <TrendingDown size={16} color={colors.danger} />
          </View>
          <Text style={styles.statLabel}>Bills</Text>
          <Text style={styles.statValue}>{formatCurrency(summary.totalBillsScheduled)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  monthLabel: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  yearLabel: {
    ...typography.title3,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.subhead,
    color: colors.textInverse,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: colors.textInverse,
    letterSpacing: -1,
  },
  negativeNote: {
    ...typography.caption1,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    ...typography.title3,
    color: colors.textPrimary,
  },
});
