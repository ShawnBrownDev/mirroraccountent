import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { CheckCircle, Receipt, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type EmptyStateType = 'no-bills' | 'all-paid' | 'no-upcoming';

interface EmptyStateProps {
  type: EmptyStateType;
}

const config = {
  'no-bills': {
    icon: Receipt,
    title: 'No bills yet',
    description: 'Add your first bill to start tracking your monthly expenses.',
    iconColor: colors.textTertiary,
    bgColor: colors.borderLight,
    accentColor: colors.accent,
  },
  'all-paid': {
    icon: Sparkles,
    title: "You're all set!",
    description: 'All bills for this month have been paid. Great job staying on top of things.',
    iconColor: colors.success,
    bgColor: colors.successMuted,
    accentColor: colors.success,
  },
  'no-upcoming': {
    icon: CheckCircle,
    title: 'No outstanding bills',
    description: 'All your bills are covered for now. Enjoy your peace of mind.',
    iconColor: colors.success,
    bgColor: colors.successMuted,
    accentColor: colors.success,
  },
};

export default function EmptyState({ type }: EmptyStateProps) {
  const { icon: Icon, title, description, iconColor, bgColor, accentColor } = config[type];
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <View style={[styles.iconInner, { backgroundColor: `${accentColor}15` }]}>
          <Icon size={32} color={iconColor} strokeWidth={1.5} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
