import BillCard from '@/components/BillCard';
import EmptyState from '@/components/EmptyState';
import MonthlySummary from '@/components/MonthlySummary';
import SectionHeader from '@/components/SectionHeader';
import { OverviewSkeleton } from '@/components/SkeletonLoader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useMirror } from '@/providers/MirrorProvider';
import { useRouter } from 'expo-router';
import { CheckCircle, Clock } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function OverviewScreen() {
  const router = useRouter();
  const {
    upcomingBills,
    paidBills,
    summary,
    isLoading,
    markBillPaid,
    markBillUnpaid,
    bills,
  } = useMirror();

  const [refreshing, setRefreshing] = useState(false);
  const [paidCollapsed, setPaidCollapsed] = useState(true);
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.stagger(50, [
        Animated.spring(listAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, listAnim]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleBillPress = useCallback((billId: string) => {
    router.push(`/bill/${billId}`);
  }, [router]);

  const handleMarkPaid = useCallback((billId: string) => {
    markBillPaid(billId);
  }, [markBillPaid]);

  const handleMarkUnpaid = useCallback((billId: string) => {
    markBillUnpaid(billId);
  }, [markBillUnpaid]);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const hasNoBills = bills.length === 0;
  const hasNoUpcoming = upcomingBills.length === 0 && paidBills.length > 0;
  

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
      }
      testID="overview-scroll"
    >
      <MonthlySummary summary={summary} />

      {hasNoBills ? (
        <EmptyState type="no-bills" />
      ) : (
        <Animated.View
          style={{
            opacity: listAnim,
            transform: [{
              translateY: listAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          }}
        >
          {upcomingBills.length > 0 && (
            <View style={styles.quickInsight}>
              <View style={styles.insightIcon}>
                <Clock size={14} color={colors.warning} strokeWidth={2.5} />
              </View>
              <Text style={styles.insightText}>
                <Text style={styles.insightHighlight}>{upcomingBills.length} bill{upcomingBills.length !== 1 ? 's' : ''}</Text>
                {' '}remaining this month
              </Text>
            </View>
          )}

          <SectionHeader 
            title="Upcoming" 
            count={upcomingBills.length}
          />
          
          {hasNoUpcoming ? (
            <EmptyState type="no-upcoming" />
          ) : (
            upcomingBills.map((bill, index) => (
              <Animated.View
                key={bill.id}
                style={{
                  opacity: listAnim,
                  transform: [{
                    translateY: listAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20 + index * 10, 0],
                    }),
                  }],
                }}
              >
                <BillCard
                  bill={bill}
                  onPress={() => handleBillPress(bill.id)}
                  onMarkPaid={() => handleMarkPaid(bill.id)}
                  onMarkUnpaid={() => handleMarkUnpaid(bill.id)}
                />
              </Animated.View>
            ))
          )}

          {paidBills.length > 0 && (
            <>
              {paidCollapsed && (
                <View style={styles.paidSummary}>
                  <View style={styles.paidSummaryIcon}>
                    <CheckCircle size={14} color={colors.success} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.paidSummaryText}>
                    <Text style={styles.paidSummaryHighlight}>{paidBills.length} bill{paidBills.length !== 1 ? 's' : ''}</Text>
                    {' '}paid this month
                  </Text>
                </View>
              )}
              
              <SectionHeader
                title="Paid This Month"
                count={paidBills.length}
                isCollapsible
                isCollapsed={paidCollapsed}
                onToggle={() => setPaidCollapsed(!paidCollapsed)}
              />
              
              {!paidCollapsed &&
                paidBills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onPress={() => handleBillPress(bill.id)}
                    onMarkPaid={() => handleMarkPaid(bill.id)}
                    onMarkUnpaid={() => handleMarkUnpaid(bill.id)}
                  />
                ))}
            </>
          )}
        </Animated.View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  quickInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningMuted,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  insightIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    ...typography.subhead,
    color: colors.textSecondary,
    flex: 1,
  },
  insightHighlight: {
    ...typography.subheadMedium,
    color: colors.textPrimary,
  },
  paidSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successMuted,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  paidSummaryIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidSummaryText: {
    ...typography.subhead,
    color: colors.textSecondary,
    flex: 1,
  },
  paidSummaryHighlight: {
    ...typography.subheadMedium,
    color: colors.success,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});
