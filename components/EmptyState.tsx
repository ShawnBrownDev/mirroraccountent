import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Receipt } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

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
  },
  'all-paid': {
    icon: CheckCircle,
    title: "You're all set",
    description: 'All bills for this month have been paid.',
    iconColor: colors.success,
    bgColor: colors.successLight,
  },
  'no-upcoming': {
    icon: CheckCircle,
    title: 'No outstanding bills',
    description: 'All your bills are covered for now.',
    iconColor: colors.success,
    bgColor: colors.successLight,
  },
};

export default function EmptyState({ type }: EmptyStateProps) {
  const { icon: Icon, title, description, iconColor, bgColor } = config[type];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Icon size={32} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
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
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});