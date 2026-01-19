import { IncomeProfile } from './income';

export interface UserProfile {
  monthlyIncome?: number;
  incomeProfile?: IncomeProfile;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalBillsScheduled: number;
  totalBillsPaid: number;
  remainingBalance: number;
  upcomingBillsCount: number;
  paidBillsCount: number;
}
