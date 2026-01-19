import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { MonthlySummary as MonthlySummaryType } from '@/types/user';
import { getMonthName } from '@/utils/date';
import { formatCurrency } from '@/utils/money';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ProgressRing from './ProgressRing';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

export default function MonthlySummary({ summary }: MonthlySummaryProps) {
  const isPositive = summary.remainingBalance >= 0;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const billsPaidProgress = summary.totalBillsScheduled > 0
    ? Math.min((summary.totalBillsPaid / summary.totalBillsScheduled) * 100, 100)
    : 0;
  
  const coveragePercent = summary.totalIncome > 0
    ? Math.round((summary.totalBillsScheduled / summary.totalIncome) * 100)
    : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.monthLabel}>{getMonthName(summary.month)}</Text>
          <Text style={styles.yearLabel}>{summary.year}</Text>
        </View>
        {isPositive && summary.remainingBalance > 0 && (
          <View style={styles.statusBadge}>
            <Sparkles size={12} color={colors.success} />
            <Text style={styles.statusText}>On Track</Text>
          </View>
        )}
      </View>

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.balanceContent}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Remaining Balance</Text>
            <Text style={styles.balanceAmount}>
              {isPositive ? '' : '-'}{formatCurrency(Math.abs(summary.remainingBalance))}
            </Text>
            {!isPositive && (
              <View style={styles.overBudgetBadge}>
                <Text style={styles.overBudgetText}>Over budget</Text>
              </View>
            )}
            {isPositive && summary.totalIncome > 0 && (
              <Text style={styles.coverageText}>
                {100 - coveragePercent}% of income remaining
              </Text>
            )}
          </View>
          
          <View style={styles.ringContainer}>
            <ProgressRing
              progress={billsPaidProgress}
              size={80}
              strokeWidth={8}
              backgroundColor="rgba(255,255,255,0.2)"
              useGradient={false}
              progressColor="rgba(255,255,255,0.9)"
            >
              <Text style={styles.ringPercent}>{Math.round(billsPaidProgress)}%</Text>
              <Text style={styles.ringLabel}>paid</Text>
            </ProgressRing>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.successMuted }]}>
              <ArrowUpRight size={16} color={colors.success} strokeWidth={2.5} />
            </View>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <Text style={styles.statValue}>{formatCurrency(summary.totalIncome)}</Text>
          <Text style={styles.statSubtext}>Monthly estimate</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.dangerMuted }]}>
              <ArrowDownRight size={16} color={colors.danger} strokeWidth={2.5} />
            </View>
            <Text style={styles.statLabel}>Bills</Text>
          </View>
          <Text style={styles.statValue}>{formatCurrency(summary.totalBillsScheduled)}</Text>
          <Text style={styles.statSubtext}>
            {formatCurrency(summary.totalBillsPaid)} paid
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  monthLabel: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  yearLabel: {
    ...typography.subhead,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption1Medium,
    color: colors.success,
  },
  balanceCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.large,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    ...typography.subheadMedium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: colors.textInverse,
    letterSpacing: -1,
  },
  overBudgetBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  overBudgetText: {
    ...typography.caption1Medium,
    color: colors.textInverse,
  },
  coverageText: {
    ...typography.footnote,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.sm,
  },
  ringContainer: {
    marginLeft: spacing.md,
  },
  ringPercent: {
    ...typography.headline,
    color: colors.textInverse,
    marginBottom: -2,
  },
  ringLabel: {
    ...typography.caption2,
    color: 'rgba(255,255,255,0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    ...typography.footnoteMedium,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  statSubtext: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
});
