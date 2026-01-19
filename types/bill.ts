export type BillFrequency = 'monthly' | 'weekly' | 'biweekly' | 'quarterly' | 'yearly';

export interface Bill {
  id: string;
  name: string;
  dueDay: number;
  frequency: BillFrequency;
  expectedAmount: number;
  category?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillPayment {
  id: string;
  billId: string;
  month: number;
  year: number;
  isPaid: boolean;
  actualAmount?: number;
  paidAt?: string;
}

export interface MonthlyBillView extends Bill {
  payment?: BillPayment;
  isPaidThisMonth: boolean;
  amountDue: number;
  dueDate: Date;
  isOverdue: boolean;
  daysUntilDue: number;
}
