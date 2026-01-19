import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  count?: number;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function SectionHeader({
  title,
  count,
  isCollapsible = false,
  isCollapsed = false,
  onToggle,
}: SectionHeaderProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      {isCollapsible && (
        <View style={styles.chevronContainer}>
          {isCollapsed ? (
            <ChevronDown size={18} color={colors.textTertiary} strokeWidth={2} />
          ) : (
            <ChevronUp size={18} color={colors.textTertiary} strokeWidth={2} />
          )}
        </View>
      )}
    </View>
  );

  if (isCollapsible && onToggle) {
    return (
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.footnoteMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    ...typography.caption1Medium,
    color: colors.accent,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});