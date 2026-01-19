import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMirror } from '@/providers/MirrorProvider';
import BillCard from '@/components/BillCard';
import EmptyState from '@/components/EmptyState';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export default function BillsScreen() {
  const router = useRouter();
  const {
    monthlyBills,
    isLoading,
    markBillPaid,
    markBillUnpaid,
  } = useMirror();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleAddBill = useCallback(() => {
    router.push('/bill/create');
  }, [router]);

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

  const sortedBills = [...monthlyBills].sort((a, b) => a.dueDay - b.dueDay);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        testID="bills-scroll"
      >
        {monthlyBills.length === 0 ? (
          <EmptyState type="no-bills" />
        ) : (
          <>
            <View style={styles.headerInfo}>
              <Text style={styles.headerText}>
                {monthlyBills.length} {monthlyBills.length === 1 ? 'bill' : 'bills'} this month
              </Text>
            </View>
            {sortedBills.map((bill) => (
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
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddBill}
        activeOpacity={0.8}
        testID="add-bill-fab"
      >
        <Plus size={24} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerInfo: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
