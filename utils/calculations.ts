import { Bill, BillPayment, MonthlyBillView } from '@/types/bill';
import { MonthlySummary } from '@/types/user';
import { IncomeProfile, FREQUENCY_MULTIPLIERS } from '@/types/income';
import { getDueDateForMonth, getDaysUntilDue, isOverdue } from './date';

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
    
    const dueDate = getDueDateForMonth(bill.dueDay, month, year);
    const isPaidThisMonth = payment?.isPaid ?? false;
    const amountDue = payment?.actualAmount ?? bill.expectedAmount;
    
    return {
      ...bill,
      payment,
      isPaidThisMonth,
      amountDue,
      dueDate,
      isOverdue: !isPaidThisMonth && isOverdue(dueDate),
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
