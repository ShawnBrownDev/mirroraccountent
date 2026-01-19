import { borderRadius, colors, spacing } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonBox({ 
  width = '100%', 
  height = 20, 
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

export function BillCardSkeleton() {
  return (
    <View style={styles.billCard}>
      <SkeletonBox width={40} height={40} borderRadius={borderRadius.md} />
      <View style={styles.billContent}>
        <SkeletonBox width={120} height={18} />
        <SkeletonBox width={80} height={14} style={{ marginTop: spacing.xs }} />
      </View>
      <View style={styles.billRight}>
        <SkeletonBox width={70} height={18} />
        <SkeletonBox width={80} height={28} borderRadius={borderRadius.full} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

export function SummarySkeleton() {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryHeader}>
        <View>
          <SkeletonBox width={140} height={36} />
          <SkeletonBox width={60} height={16} style={{ marginTop: spacing.xs }} />
        </View>
        <SkeletonBox width={80} height={28} borderRadius={borderRadius.full} />
      </View>
      
      <View style={styles.balanceCard}>
        <View style={styles.balanceContent}>
          <View style={{ flex: 1 }}>
            <SkeletonBox width={120} height={16} />
            <SkeletonBox width={180} height={40} style={{ marginTop: spacing.sm }} />
            <SkeletonBox width={140} height={14} style={{ marginTop: spacing.sm }} />
          </View>
          <SkeletonBox width={80} height={80} borderRadius={40} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SkeletonBox width={28} height={28} borderRadius={borderRadius.sm} />
          <SkeletonBox width={60} height={14} style={{ marginTop: spacing.sm }} />
          <SkeletonBox width={80} height={22} style={{ marginTop: spacing.xs }} />
        </View>
        <View style={styles.statCard}>
          <SkeletonBox width={28} height={28} borderRadius={borderRadius.sm} />
          <SkeletonBox width={60} height={14} style={{ marginTop: spacing.sm }} />
          <SkeletonBox width={80} height={22} style={{ marginTop: spacing.xs }} />
        </View>
      </View>
    </View>
  );
}

export function OverviewSkeleton() {
  return (
    <View style={styles.container}>
      <SummarySkeleton />
      <View style={styles.sectionHeader}>
        <SkeletonBox width={100} height={18} />
        <SkeletonBox width={24} height={24} borderRadius={12} />
      </View>
      <BillCardSkeleton />
      <BillCardSkeleton />
      <BillCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeleton: {
    backgroundColor: colors.skeleton,
  },
  summaryContainer: {
    padding: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  balanceCard: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  billContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  billRight: {
    alignItems: 'flex-end',
  },
});