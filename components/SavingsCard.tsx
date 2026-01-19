import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { SAVINGS_COLORS, SavingsGoal } from '@/types/savings';
import { formatCurrency } from '@/utils/money';
import {
  Briefcase,
  Car,
  ChevronRight,
  Gift,
  GraduationCap,
  Heart,
  Home,
  PiggyBank,
  Plane,
  Shield,
  Sparkles,
  Umbrella,
} from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SavingsCardProps {
  goal: SavingsGoal;
  onPress?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ size: number; color: string; strokeWidth?: number }>> = {
  'piggy-bank': PiggyBank,
  'home': Home,
  'car': Car,
  'plane': Plane,
  'gift': Gift,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'umbrella': Umbrella,
  'shield': Shield,
};

export default function SavingsCard({ goal, onPress }: SavingsCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const progress = goal.targetAmount > 0 
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;
  
  const isComplete = goal.currentAmount >= goal.targetAmount;
  const goalColor = goal.color || SAVINGS_COLORS[0];
  const IconComponent = ICON_MAP[goal.icon || 'piggy-bank'] || PiggyBank;

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

  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, isComplete && styles.cardComplete]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={`savings-card-${goal.id}`}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${goalColor}15` }]}>
            <IconComponent size={20} color={goalColor} strokeWidth={1.5} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>{goal.name}</Text>
            {isComplete ? (
              <View style={styles.completeLabel}>
                <Sparkles size={12} color={colors.success} strokeWidth={2} />
                <Text style={styles.completeLabelText}>Goal Reached!</Text>
              </View>
            ) : (
              <Text style={styles.remainingLabel}>
                {formatCurrency(remaining)} to go
              </Text>
            )}
          </View>
          <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isComplete ? colors.success : goalColor,
                },
              ]}
            />
          </View>
          
          <View style={styles.amountRow}>
            <Text style={[styles.currentAmount, { color: isComplete ? colors.success : goalColor }]}>
              {formatCurrency(goal.currentAmount)}
            </Text>
            <Text style={styles.targetAmount}>
              of {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
  },
  cardComplete: {
    borderWidth: 1,
    borderColor: colors.successMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  remainingLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  completeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completeLabelText: {
    ...typography.footnoteMedium,
    color: colors.success,
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    ...typography.headline,
    fontVariant: ['tabular-nums'],
  },
  targetAmount: {
    ...typography.footnote,
    color: colors.textTertiary,
  },
});
