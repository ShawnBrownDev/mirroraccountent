import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

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
        <View style={styles.chevron}>
          {isCollapsed ? (
            <ChevronDown size={20} color={colors.textTertiary} />
          ) : (
            <ChevronUp size={20} color={colors.textTertiary} />
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
    marginTop: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headline,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  countBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  chevron: {
    padding: spacing.xs,
  },
});
