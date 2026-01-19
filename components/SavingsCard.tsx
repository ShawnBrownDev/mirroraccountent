import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  PiggyBank,
  Home,
  Car,
  Plane,
  Gift,
  Heart,
  GraduationCap,
  Briefcase,
  Umbrella,
  Shield,
  ChevronRight,
} from 'lucide-react-native';
import { SavingsGoal, SAVINGS_COLORS } from '@/types/savings';
import { formatCurrency } from '@/utils/money';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface SavingsCardProps {
  goal: SavingsGoal;
  onPress?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ size: number; color: string }>> = {
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
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={`savings-card-${goal.id}`}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${goalColor}15` }]}>
            <IconComponent size={20} color={goalColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>{goal.name}</Text>
            <Text style={styles.targetLabel}>
              Goal: {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textTertiary} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
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
            <Text style={[styles.currentAmount, { color: goalColor }]}>
              {formatCurrency(goal.currentAmount)}
            </Text>
            <Text style={styles.progressText}>
              {progress.toFixed(0)}%
            </Text>
          </View>
        </View>

        {isComplete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>Goal Reached!</Text>
          </View>
        )}
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  targetLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  progressSection: {
    gap: spacing.xs,
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
  },
  progressText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  completeBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.successLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  completeText: {
    ...typography.caption1,
    color: colors.success,
    fontWeight: '600' as const,
  },
});
