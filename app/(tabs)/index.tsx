import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMirror } from '@/providers/MirrorProvider';
import MonthlySummary from '@/components/MonthlySummary';
import SectionHeader from '@/components/SectionHeader';
import BillCard from '@/components/BillCard';
import EmptyState from '@/components/EmptyState';
import { colors, spacing } from '@/constants/theme';

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
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
        <>
          <SectionHeader title="Upcoming" count={upcomingBills.length} />
          
          {hasNoUpcoming ? (
            <EmptyState type="no-upcoming" />
          ) : (
            upcomingBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={() => handleBillPress(bill.id)}
                onMarkPaid={() => handleMarkPaid(bill.id)}
                onMarkUnpaid={() => handleMarkUnpaid(bill.id)}
              />
            ))
          )}

          {paidBills.length > 0 && (
            <>
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
        </>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});