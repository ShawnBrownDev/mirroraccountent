export type PayFrequency = 'weekly' | 'biweekly' | 'monthly';

export type IncomeMode = 'fixed' | 'variable';

export interface FixedIncome {
  mode: 'fixed';
  amount: number;
  frequency: PayFrequency;
  nextPayDate?: string;
}

export interface VariableIncome {
  mode: 'variable';
  minAmount: number;
  maxAmount: number;
  notes?: string;
}

export type IncomeProfile = FixedIncome | VariableIncome;

export interface IncomeProfileState {
  incomeProfile?: IncomeProfile;
  estimatedMonthlyIncome: number;
}

export const FREQUENCY_LABELS: Record<PayFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
};

export const FREQUENCY_MULTIPLIERS: Record<PayFrequency, number> = {
  weekly: 4.33,
  biweekly: 2.17,
  monthly: 1,
};
