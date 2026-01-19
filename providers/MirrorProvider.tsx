import { Bill, BillPayment } from '@/types/bill';
import { IncomeProfile } from '@/types/income';
import { SavingsGoal } from '@/types/savings';
import { UserProfile } from '@/types/user';
import { calculateEstimatedMonthlyIncome, calculateMonthlySummary, getBillsForMonth } from '@/utils/calculations';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEYS = {
  BILLS: 'mirror_bills',
  PAYMENTS: 'mirror_payments',
  PROFILE: 'mirror_profile',
  SAVINGS: 'mirror_savings',
};

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const defaultProfile: UserProfile = {
  notificationsEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function useMirrorData() {
  const queryClient = useQueryClient();
  const [currentMonth] = useState(getCurrentMonth());
  const [currentYear] = useState(getCurrentYear());

  const billsQuery = useQuery({
    queryKey: ['bills'],
    queryFn: async (): Promise<Bill[]> => {
      console.log('[Mirror] Loading bills from storage');
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BILLS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<BillPayment[]> => {
      console.log('[Mirror] Loading payments from storage');
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      console.log('[Mirror] Loading profile from storage');
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      return stored ? JSON.parse(stored) : defaultProfile;
    },
  });

  const savingsQuery = useQuery({
    queryKey: ['savings'],
    queryFn: async (): Promise<SavingsGoal[]> => {
      console.log('[Mirror] Loading savings from storage');
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const { mutate: saveBills } = useMutation({
    mutationFn: async (bills: Bill[]) => {
      console.log('[Mirror] Saving bills to storage');
      await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
      return bills;
    },
    onSuccess: (bills) => {
      queryClient.setQueryData(['bills'], bills);
    },
  });

  const { mutate: savePayments } = useMutation({
    mutationFn: async (payments: BillPayment[]) => {
      console.log('[Mirror] Saving payments to storage');
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      return payments;
    },
    onSuccess: (payments) => {
      queryClient.setQueryData(['payments'], payments);
    },
  });

  const { mutate: saveProfile } = useMutation({
    mutationFn: async (profile: UserProfile) => {
      console.log('[Mirror] Saving profile to storage');
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      return profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile);
    },
  });

  const { mutate: saveSavings } = useMutation({
    mutationFn: async (savings: SavingsGoal[]) => {
      console.log('[Mirror] Saving savings goals to storage');
      await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
      return savings;
    },
    onSuccess: (savings) => {
      queryClient.setQueryData(['savings'], savings);
    },
  });

  const bills = useMemo(() => billsQuery.data ?? [], [billsQuery.data]);
  const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);
  const profile = useMemo(() => profileQuery.data ?? defaultProfile, [profileQuery.data]);
  const savings = useMemo(() => savingsQuery.data ?? [], [savingsQuery.data]);

  const monthlyBills = useMemo(() => {
    return getBillsForMonth(bills, payments, currentMonth, currentYear);
  }, [bills, payments, currentMonth, currentYear]);

  const upcomingBills = useMemo(() => {
    return monthlyBills
      .filter((b) => !b.isPaidThisMonth)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [monthlyBills]);

  const paidBills = useMemo(() => {
    return monthlyBills.filter((b) => b.isPaidThisMonth);
  }, [monthlyBills]);

  const estimatedMonthlyIncome = useMemo(() => {
    if (profile.incomeProfile) {
      return calculateEstimatedMonthlyIncome(profile.incomeProfile);
    }
    return profile.monthlyIncome ?? 0;
  }, [profile.incomeProfile, profile.monthlyIncome]);

  const summary = useMemo(() => {
    return calculateMonthlySummary(
      monthlyBills,
      estimatedMonthlyIncome,
      currentMonth,
      currentYear
    );
  }, [monthlyBills, estimatedMonthlyIncome, currentMonth, currentYear]);

  const addBill = useCallback((billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBill: Bill = {
      ...billData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('[Mirror] Adding bill:', newBill.name);
    saveBills([...bills, newBill]);
    return newBill;
  }, [bills, saveBills]);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    console.log('[Mirror] Updating bill:', id);
    const updatedBills = bills.map((bill) =>
      bill.id === id
        ? { ...bill, ...updates, updatedAt: new Date().toISOString() }
        : bill
    );
    saveBills(updatedBills);
  }, [bills, saveBills]);

  const deleteBill = useCallback((id: string) => {
    console.log('[Mirror] Deleting bill:', id);
    saveBills(bills.filter((b) => b.id !== id));
    savePayments(payments.filter((p) => p.billId !== id));
  }, [bills, payments, saveBills, savePayments]);

  const markBillPaid = useCallback((billId: string, actualAmount?: number) => {
    console.log('[Mirror] Marking bill as paid:', billId);
    const existingPayment = payments.find(
      (p) => p.billId === billId && p.month === currentMonth && p.year === currentYear
    );

    if (existingPayment) {
      const updatedPayments = payments.map((p) =>
        p.id === existingPayment.id
          ? { ...p, isPaid: true, actualAmount, paidAt: new Date().toISOString() }
          : p
      );
      savePayments(updatedPayments);
    } else {
      const newPayment: BillPayment = {
        id: generateId(),
        billId,
        month: currentMonth,
        year: currentYear,
        isPaid: true,
        actualAmount,
        paidAt: new Date().toISOString(),
      };
      savePayments([...payments, newPayment]);
    }
  }, [payments, currentMonth, currentYear, savePayments]);

  const markBillUnpaid = useCallback((billId: string) => {
    console.log('[Mirror] Marking bill as unpaid:', billId);
    const updatedPayments = payments.filter(
      (p) => !(p.billId === billId && p.month === currentMonth && p.year === currentYear)
    );
    savePayments(updatedPayments);
  }, [payments, currentMonth, currentYear, savePayments]);

  const updateIncome = useCallback((income: number) => {
    console.log('[Mirror] Updating income:', income);
    saveProfile({
      ...profile,
      monthlyIncome: income,
      updatedAt: new Date().toISOString(),
    });
  }, [profile, saveProfile]);

  const updateIncomeProfile = useCallback((incomeProfile: IncomeProfile) => {
    console.log('[Mirror] Updating income profile:', incomeProfile);
    const estimated = calculateEstimatedMonthlyIncome(incomeProfile);
    saveProfile({
      ...profile,
      incomeProfile,
      monthlyIncome: estimated,
      updatedAt: new Date().toISOString(),
    });
  }, [profile, saveProfile]);

  const updateNotificationSettings = useCallback((enabled: boolean) => {
    console.log('[Mirror] Updating notification settings:', enabled);
    saveProfile({
      ...profile,
      notificationsEnabled: enabled,
      updatedAt: new Date().toISOString(),
    });
  }, [profile, saveProfile]);

  const addSavingsGoal = useCallback((goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('[Mirror] Adding savings goal:', newGoal.name);
    saveSavings([...savings, newGoal]);
    return newGoal;
  }, [savings, saveSavings]);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    console.log('[Mirror] Updating savings goal:', id);
    const updatedSavings = savings.map((goal) =>
      goal.id === id
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    );
    saveSavings(updatedSavings);
  }, [savings, saveSavings]);

  const deleteSavingsGoal = useCallback((id: string) => {
    console.log('[Mirror] Deleting savings goal:', id);
    saveSavings(savings.filter((g) => g.id !== id));
  }, [savings, saveSavings]);

  const addToSavings = useCallback((goalId: string, amount: number) => {
    console.log('[Mirror] Adding to savings goal:', goalId, amount);
    const goal = savings.find((g) => g.id === goalId);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      updateSavingsGoal(goalId, { currentAmount: newAmount });
    }
  }, [savings, updateSavingsGoal]);

  const totalSavings = useMemo(() => {
    return savings.reduce((sum, goal) => sum + goal.currentAmount, 0);
  }, [savings]);

  const totalSavingsTarget = useMemo(() => {
    return savings.reduce((sum, goal) => sum + goal.targetAmount, 0);
  }, [savings]);

  const isLoading = billsQuery.isLoading || paymentsQuery.isLoading || profileQuery.isLoading || savingsQuery.isLoading;

  return {
    bills,
    monthlyBills,
    upcomingBills,
    paidBills,
    payments,
    profile,
    summary,
    estimatedMonthlyIncome,
    currentMonth,
    currentYear,
    isLoading,
    addBill,
    updateBill,
    deleteBill,
    markBillPaid,
    markBillUnpaid,
    updateIncome,
    updateIncomeProfile,
    updateNotificationSettings,
    savings,
    totalSavings,
    totalSavingsTarget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addToSavings,
  };
}

export const [MirrorProvider, useMirror] = createContextHook(useMirrorData);
