import { Bill, BillPayment, MonthlyBillView } from '@/types/bill';
import { FREQUENCY_MULTIPLIERS, IncomeProfile } from '@/types/income';
import { MonthlySummary } from '@/types/user';
import { getDaysUntilDue, getDueDateForMonth, getNextDueDate } from './date';

export function getBillsForMonth(
  bills: Bill[],
  payments: BillPayment[],
  month: number,
  year: number
): MonthlyBillView[] {
  return bills.map((bill) => {
    const payment = payments.find(
      (p) => p.billId === bill.id && p.month === month && p.year === year
    );
    
    const isPaidThisMonth = payment?.isPaid ?? false;
    const amountDue = payment?.actualAmount ?? bill.expectedAmount;
    
    const dueDate = isPaidThisMonth 
      ? getDueDateForMonth(bill.dueDay, month, year)
      : getNextDueDate(bill.dueDay);
    
    return {
      ...bill,
      payment,
      isPaidThisMonth,
      amountDue,
      dueDate,
      isOverdue: false,
      daysUntilDue: getDaysUntilDue(dueDate),
    };
  });
}

export function calculateMonthlySummary(
  bills: MonthlyBillView[],
  monthlyIncome: number,
  month: number,
  year: number
): MonthlySummary {
  const paidBills = bills.filter((b) => b.isPaidThisMonth);
  const unpaidBills = bills.filter((b) => !b.isPaidThisMonth);
  
  const totalBillsScheduled = bills.reduce((sum, b) => sum + b.expectedAmount, 0);
  const totalBillsPaid = paidBills.reduce((sum, b) => sum + b.amountDue, 0);
  const totalBillsRemaining = unpaidBills.reduce((sum, b) => sum + b.expectedAmount, 0);
  
  const remainingBalance = monthlyIncome - totalBillsPaid - totalBillsRemaining;
  
  return {
    month,
    year,
    totalIncome: monthlyIncome,
    totalBillsScheduled,
    totalBillsPaid,
    remainingBalance,
    upcomingBillsCount: unpaidBills.length,
    paidBillsCount: paidBills.length,
  };
}

export function calculateAverageMonthlyBills(bills: Bill[]): number {
  if (bills.length === 0) return 0;
  return bills.reduce((sum, b) => sum + b.expectedAmount, 0);
}

export function categorizeFixedVsFlexible(bills: Bill[]): {
  fixed: Bill[];
  flexible: Bill[];
} {
  const fixedCategories = ['rent', 'mortgage', 'insurance', 'subscription', 'loan'];
  
  return {
    fixed: bills.filter((b) => 
      b.category && fixedCategories.includes(b.category.toLowerCase())
    ),
    flexible: bills.filter((b) => 
      !b.category || !fixedCategories.includes(b.category.toLowerCase())
    ),
  };
}

export function calculateEstimatedMonthlyIncome(incomeProfile?: IncomeProfile): number {
  if (!incomeProfile) return 0;

  if (incomeProfile.mode === 'fixed') {
    const multiplier = FREQUENCY_MULTIPLIERS[incomeProfile.frequency];
    return Math.round(incomeProfile.amount * multiplier * 100) / 100;
  } else {
    return incomeProfile.minAmount;
  }
}
