import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { MonthlyBillView } from '@/types/bill';
import { formatDueDate } from '@/utils/date';
import { formatCurrency } from '@/utils/money';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Check, ChevronRight, Clock } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const checkAnim = useRef(new Animated.Value(bill.isPaidThisMonth ? 1 : 0)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleTogglePaid = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.spring(checkAnim, {
      toValue: bill.isPaidThisMonth ? 0 : 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();

    if (bill.isPaidThisMonth) {
      onMarkUnpaid();
    } else {
      onMarkPaid();
    }
  }, [bill.isPaidThisMonth, onMarkPaid, onMarkUnpaid, checkAnim]);

  const getStatusConfig = () => {
    if (bill.isPaidThisMonth) {
      return {
        icon: Check,
        color: colors.success,
        bgColor: colors.successMuted,
        label: 'Paid',
      };
    }
    if (bill.isOverdue) {
      return {
        icon: AlertTriangle,
        color: colors.danger,
        bgColor: colors.dangerMuted,
        label: 'Overdue',
      };
    }
    if (bill.daysUntilDue <= 3) {
      return {
        icon: Clock,
        color: colors.warning,
        bgColor: colors.warningMuted,
        label: formatDueDate(bill.dueDate),
      };
    }
    return {
      icon: Clock,
      color: colors.textTertiary,
      bgColor: colors.borderLight,
      label: formatDueDate(bill.dueDate),
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[
          styles.card,
          bill.isPaidThisMonth && styles.cardPaid,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`bill-card-${bill.id}`}
      >
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: status.bgColor }]}
          onPress={handleTogglePaid}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          testID={`bill-status-${bill.id}`}
        >
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <StatusIcon 
              size={18} 
              color={status.color} 
              strokeWidth={2.5} 
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text 
            style={[
              styles.name,
              bill.isPaidThisMonth && styles.namePaid,
            ]} 
            numberOfLines={1}
          >
            {bill.name}
          </Text>
          <Text style={[styles.dueDate, { color: status.color }]}>
            {status.label}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <Text style={[
            styles.amount,
            bill.isPaidThisMonth && styles.amountPaid,
          ]}>
            {formatCurrency(bill.amountDue)}
          </Text>
          
          {!bill.isPaidThisMonth ? (
            <TouchableOpacity
              style={styles.paidButton}
              onPress={handleTogglePaid}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
              testID={`mark-paid-${bill.id}`}
            >
              <Check size={14} color={colors.textInverse} strokeWidth={2.5} />
              <Text style={styles.paidButtonText}>Mark Paid</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.chevronContainer}>
              <ChevronRight size={18} color={colors.textTertiary} />
            </View>
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
  },
  cardPaid: {
    backgroundColor: colors.surfacePressed,
    ...shadows.small,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
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
  namePaid: {
    color: colors.textSecondary,
  },
  dueDate: {
    ...typography.footnote,
    marginTop: spacing.xxs,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  amount: {
    ...typography.headline,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amountPaid: {
    color: colors.textSecondary,
  },
  paidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.colored(colors.accent),
  },
  paidButtonText: {
    ...typography.caption1Medium,
    color: colors.textInverse,
  },
  chevronContainer: {
    padding: spacing.xs,
  },
});
