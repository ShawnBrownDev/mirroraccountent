import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { Check, Clock, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MonthlyBillView } from '@/types/bill';
import { formatCurrency } from '@/utils/money';
import { formatDueDate } from '@/utils/date';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface BillCardProps {
  bill: MonthlyBillView;
  onPress: () => void;
  onMarkPaid: () => void;
  onMarkUnpaid: () => void;
}

export default function BillCard({
  bill,
  onPress,
  onMarkPaid,
  onMarkUnpaid,
}: BillCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleTogglePaid = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (bill.isPaidThisMonth) {
      onMarkUnpaid();
    } else {
      onMarkPaid();
    }
  }, [bill.isPaidThisMonth, onMarkPaid, onMarkUnpaid]);

  const getStatusColor = () => {
    if (bill.isPaidThisMonth) return colors.success;
    if (bill.isOverdue) return colors.danger;
    if (bill.daysUntilDue <= 3) return colors.warning;
    return colors.textSecondary;
  };

  const getStatusBgColor = () => {
    if (bill.isPaidThisMonth) return colors.successLight;
    if (bill.isOverdue) return colors.dangerLight;
    if (bill.daysUntilDue <= 3) return colors.warningLight;
    return colors.borderLight;
  };

  const StatusIcon = bill.isPaidThisMonth
    ? Check
    : bill.isOverdue
    ? AlertCircle
    : Clock;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`bill-card-${bill.id}`}
      >
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: getStatusBgColor() }]}
          onPress={handleTogglePaid}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`bill-status-${bill.id}`}
        >
          <StatusIcon size={18} color={getStatusColor()} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {bill.name}
          </Text>
          <Text style={[styles.dueDate, { color: getStatusColor() }]}>
            {bill.isPaidThisMonth ? 'Paid' : formatDueDate(bill.dueDate)}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amount}>{formatCurrency(bill.amountDue)}</Text>
          {!bill.isPaidThisMonth && (
            <TouchableOpacity
              style={styles.paidButton}
              onPress={handleTogglePaid}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`mark-paid-${bill.id}`}
            >
              <Check size={14} color={colors.textInverse} strokeWidth={2.5} />
              <Text style={styles.paidButtonText}>Paid</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  card: {
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
  statusButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  dueDate: {
    ...typography.footnote,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  paidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  paidButtonText: {
    ...typography.caption1,
    color: colors.textInverse,
    fontWeight: '600' as const,
  },
});
