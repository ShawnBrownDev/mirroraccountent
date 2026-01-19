import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { MonthlyBillView } from '@/types/bill';
import { getDaysInMonth, getMonthName } from '@/utils/date';
import { formatCurrency } from '@/utils/money';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CalendarViewProps {
  bills: MonthlyBillView[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

interface DayData {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bills: MonthlyBillView[];
  totalAmount: number;
  hasPaidBills: boolean;
  hasUnpaidBills: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({
  bills,
  selectedDate,
  onDateSelect,
  currentMonth,
  currentYear,
  onMonthChange,
}: CalendarViewProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    const daysInPrevMonth = getDaysInMonth(
      currentMonth === 0 ? 11 : currentMonth - 1,
      currentMonth === 0 ? currentYear - 1 : currentYear
    );

    const days: DayData[] = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        day,
        date: new Date(prevYear, prevMonth, day),
        isCurrentMonth: false,
        isToday: false,
        bills: [],
        totalAmount: 0,
        hasPaidBills: false,
        hasUnpaidBills: false,
      });
    }

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      
      const dayBills = bills.filter((bill) => bill.dueDay === day);
      const totalAmount = dayBills.reduce((sum, b) => sum + b.amountDue, 0);
      const hasPaidBills = dayBills.some((b) => b.isPaidThisMonth);
      const hasUnpaidBills = dayBills.some((b) => !b.isPaidThisMonth);

      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday,
        bills: dayBills,
        totalAmount,
        hasPaidBills,
        hasUnpaidBills,
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        day,
        date: new Date(nextYear, nextMonth, day),
        isCurrentMonth: false,
        isToday: false,
        bills: [],
        totalAmount: 0,
        hasPaidBills: false,
        hasUnpaidBills: false,
      });
    }

    return days;
  }, [bills, currentMonth, currentYear, today]);

  const handlePrevMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    onMonthChange(newMonth, newYear);
  }, [currentMonth, currentYear, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    onMonthChange(newMonth, newYear);
  }, [currentMonth, currentYear, onMonthChange]);

  const handleDayPress = useCallback((dayData: DayData) => {
    if (!dayData.isCurrentMonth) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateSelect(dayData.date);
  }, [onDateSelect]);

  const isSelected = useCallback((date: Date) => {
    if (!selectedDate) return false;
    return date.getTime() === selectedDate.getTime();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {getMonthName(currentMonth)} {currentYear}
        </Text>
        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarData.map((dayData, index) => (
          <TouchableOpacity
            key={`${dayData.date.toISOString()}-${index}`}
            style={[
              styles.dayCell,
              dayData.isToday && styles.todayCell,
              isSelected(dayData.date) && styles.selectedCell,
              !dayData.isCurrentMonth && styles.otherMonthCell,
            ]}
            onPress={() => handleDayPress(dayData)}
            disabled={!dayData.isCurrentMonth}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayNumber,
                dayData.isToday && styles.todayNumber,
                isSelected(dayData.date) && styles.selectedNumber,
                !dayData.isCurrentMonth && styles.otherMonthNumber,
              ]}
            >
              {dayData.day}
            </Text>
            
            {dayData.bills.length > 0 && dayData.isCurrentMonth && (
              <View style={styles.billIndicators}>
                {dayData.hasUnpaidBills && (
                  <View style={[styles.indicator, styles.unpaidIndicator]} />
                )}
                {dayData.hasPaidBills && (
                  <View style={[styles.indicator, styles.paidIndicator]} />
                )}
              </View>
            )}
            
            {dayData.totalAmount > 0 && dayData.isCurrentMonth && (
              <Text
                style={[
                  styles.amountText,
                  dayData.hasPaidBills && !dayData.hasUnpaidBills && styles.paidAmountText,
                ]}
                numberOfLines={1}
              >
                {formatCurrency(dayData.totalAmount)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.unpaidIndicator]} />
          <Text style={styles.legendText}>Upcoming</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.paidIndicator]} />
          <Text style={styles.legendText}>Paid</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  navButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  monthTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    ...typography.caption1Medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    borderRadius: borderRadius.sm,
  },
  todayCell: {
    backgroundColor: colors.accentMuted,
  },
  selectedCell: {
    backgroundColor: colors.accent,
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayNumber: {
    ...typography.subheadMedium,
    color: colors.textPrimary,
  },
  todayNumber: {
    color: colors.accent,
    fontWeight: '700' as const,
  },
  selectedNumber: {
    color: colors.textInverse,
    fontWeight: '700' as const,
  },
  otherMonthNumber: {
    color: colors.textTertiary,
  },
  billIndicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  unpaidIndicator: {
    backgroundColor: colors.warning,
  },
  paidIndicator: {
    backgroundColor: colors.success,
  },
  amountText: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 1,
  },
  paidAmountText: {
    color: colors.success,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
});
