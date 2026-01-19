import CalendarView from '@/components/CalendarView';   
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { useMirror } from '@/providers/MirrorProvider';
import { MonthlyBillView } from '@/types/bill';
import { formatDayOfMonth, getDaysInMonth, getMonthName } from '@/utils/date';
import { formatCurrency } from '@/utils/money';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowRight, CheckCircle2, Clock, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CashFlowDay {
  day: number;
  date: Date;
  bills: MonthlyBillView[];
  outflow: number;
  runningBalance: number;
}

export default function CalendarScreen() {
  const router = useRouter();
  const {
    monthlyBills,
    estimatedMonthlyIncome,
    currentMonth: initialMonth,
    currentYear: initialYear,
    bills,
    payments,
  } = useMirror();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [viewYear, setViewYear] = useState(initialYear);
  const [refreshing, setRefreshing] = useState(false);

  const isCurrentMonth = viewMonth === initialMonth && viewYear === initialYear;

  const viewBills = useMemo(() => {
    if (isCurrentMonth) return monthlyBills;
    
    return bills.map((bill) => {
      const payment = payments.find(
        (p) => p.billId === bill.id && p.month === viewMonth && p.year === viewYear
      );
      const daysInMonth = getDaysInMonth(viewMonth, viewYear);
      const adjustedDueDay = Math.min(bill.dueDay, daysInMonth);
      const dueDate = new Date(viewYear, viewMonth, adjustedDueDay);
      
      return {
        ...bill,
        payment,
        isPaidThisMonth: payment?.isPaid ?? false,
        amountDue: payment?.actualAmount ?? bill.expectedAmount,
        dueDate,
        isOverdue: false,
        daysUntilDue: 0,
      };
    });
  }, [bills, payments, viewMonth, viewYear, isCurrentMonth, monthlyBills]);

  const cashFlowForecast = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const forecast: CashFlowDay[] = [];
    let runningBalance = estimatedMonthlyIncome;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayBills = viewBills.filter((bill) => bill.dueDay === day);
      const outflow = dayBills.reduce((sum, b) => {
        if (!b.isPaidThisMonth) return sum + b.expectedAmount;
        return sum;
      }, 0);
      
      runningBalance -= outflow;

      forecast.push({
        day,
        date: new Date(viewYear, viewMonth, day),
        bills: dayBills,
        outflow,
        runningBalance,
      });
    }

    return forecast;
  }, [viewBills, viewMonth, viewYear, estimatedMonthlyIncome]);

  const monthSummary = useMemo(() => {
    const totalBills = viewBills.reduce((sum, b) => sum + b.expectedAmount, 0);
    const paidBills = viewBills.filter((b) => b.isPaidThisMonth);
    const unpaidBills = viewBills.filter((b) => !b.isPaidThisMonth);
    const totalPaid = paidBills.reduce((sum, b) => sum + b.amountDue, 0);
    const totalRemaining = unpaidBills.reduce((sum, b) => sum + b.expectedAmount, 0);
    const endOfMonthBalance = estimatedMonthlyIncome - totalBills;

    return {
      totalBills,
      totalPaid,
      totalRemaining,
      paidCount: paidBills.length,
      unpaidCount: unpaidBills.length,
      endOfMonthBalance,
    };
  }, [viewBills, estimatedMonthlyIncome]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const day = selectedDate.getDate();
    return cashFlowForecast.find((d) => d.day === day) || null;
  }, [selectedDate, cashFlowForecast]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setViewMonth(month);
    setViewYear(year);
    setSelectedDate(null);
  }, []);

  const handleBillPress = useCallback((billId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/bill/${billId}`);
  }, [router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
    >
      <CalendarView
        bills={viewBills}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        currentMonth={viewMonth}
        currentYear={viewYear}
        onMonthChange={handleMonthChange}
      />

      <View style={styles.forecastCard}>
        <Text style={styles.sectionTitle}>Cash Flow Forecast</Text>
        <Text style={styles.sectionSubtitle}>
          Projected balance for {getMonthName(viewMonth)}
        </Text>

        <View style={styles.forecastSummary}>
          <View style={styles.forecastItem}>
            <View style={[styles.forecastIcon, { backgroundColor: colors.successMuted }]}>
              <TrendingUp size={18} color={colors.success} />
            </View>
            <View>
              <Text style={styles.forecastLabel}>Income</Text>
              <Text style={styles.forecastValue}>{formatCurrency(estimatedMonthlyIncome)}</Text>
            </View>
          </View>

          <View style={styles.forecastItem}>
            <View style={[styles.forecastIcon, { backgroundColor: colors.dangerMuted }]}>
              <TrendingDown size={18} color={colors.danger} />
            </View>
            <View>
              <Text style={styles.forecastLabel}>Bills</Text>
              <Text style={styles.forecastValue}>{formatCurrency(monthSummary.totalBills)}</Text>
            </View>
          </View>

          <View style={styles.forecastDivider} />

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>End of Month</Text>
            <Text
              style={[
                styles.balanceValue,
                monthSummary.endOfMonthBalance >= 0
                  ? styles.positiveBalance
                  : styles.negativeBalance,
              ]}
            >
              {formatCurrency(monthSummary.endOfMonthBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <CheckCircle2 size={16} color={colors.success} />
            <Text style={styles.statusText}>{monthSummary.paidCount} paid</Text>
          </View>
          <View style={styles.statusItem}>
            <Clock size={16} color={colors.warning} />
            <Text style={styles.statusText}>{monthSummary.unpaidCount} upcoming</Text>
          </View>
        </View>
      </View>

      {selectedDayData && selectedDayData.bills.length > 0 && (
        <View style={styles.selectedDayCard}>
          <View style={styles.selectedDayHeader}>
            <Text style={styles.selectedDayTitle}>
              {formatDayOfMonth(selectedDayData.day)} {getMonthName(viewMonth)}
            </Text>
            <Text style={styles.selectedDaySubtitle}>
              {selectedDayData.bills.length} bill{selectedDayData.bills.length !== 1 ? 's' : ''} due
            </Text>
          </View>

          {selectedDayData.bills.map((bill) => (
            <TouchableOpacity
              key={bill.id}
              style={styles.billItem}
              onPress={() => handleBillPress(bill.id)}
              activeOpacity={0.7}
            >
              <View style={styles.billInfo}>
                <View style={styles.billStatusDot}>
                  {bill.isPaidThisMonth ? (
                    <CheckCircle2 size={16} color={colors.success} />
                  ) : (
                    <AlertCircle size={16} color={colors.warning} />
                  )}
                </View>
                <View>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billStatus}>
                    {bill.isPaidThisMonth ? 'Paid' : 'Due'}
                  </Text>
                </View>
              </View>
              <View style={styles.billAmountRow}>
                <Text
                  style={[
                    styles.billAmount,
                    bill.isPaidThisMonth && styles.paidAmount,
                  ]}
                >
                  {formatCurrency(bill.amountDue)}
                </Text>
                <ArrowRight size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.dayBalanceRow}>
            <Text style={styles.dayBalanceLabel}>Balance after this day</Text>
            <Text
              style={[
                styles.dayBalanceValue,
                selectedDayData.runningBalance >= 0
                  ? styles.positiveBalance
                  : styles.negativeBalance,
              ]}
            >
              {formatCurrency(selectedDayData.runningBalance)}
            </Text>
          </View>
        </View>
      )}

      {selectedDate && selectedDayData && selectedDayData.bills.length === 0 && (
        <View style={styles.noBillsCard}>
          <CheckCircle2 size={32} color={colors.success} />
          <Text style={styles.noBillsTitle}>No bills due</Text>
          <Text style={styles.noBillsSubtitle}>
            {formatDayOfMonth(selectedDayData.day)} {getMonthName(viewMonth)}
          </Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  forecastCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
  forecastSummary: {
    gap: spacing.md,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  forecastIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  forecastValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  forecastDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.calloutMedium,
    color: colors.textSecondary,
  },
  balanceValue: {
    ...typography.title3,
  },
  positiveBalance: {
    color: colors.success,
  },
  negativeBalance: {
    color: colors.danger,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  selectedDayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.small,
  },
  selectedDayHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectedDayTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  selectedDaySubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  billStatusDot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  billStatus: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  billAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  billAmount: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  paidAmount: {
    color: colors.success,
  },
  dayBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  dayBalanceLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  dayBalanceValue: {
    ...typography.calloutMedium,
  },
  noBillsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  noBillsTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  noBillsSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});