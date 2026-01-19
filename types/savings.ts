export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    icon?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface SavingsContribution {
    id: string;
    goalId: string;
    amount: number;
    note?: string;
    date: string;
  }
  
  export const SAVINGS_ICONS = [
    'piggy-bank',
    'home',
    'car',
    'plane',
    'gift',
    'heart',
    'graduation-cap',
    'briefcase',
    'umbrella',
    'shield',
  ] as const;
  
  export const SAVINGS_COLORS = [
    '#4A6FA5',
    '#2E7D5A',
    '#D4A853',
    '#9B59B6',
    '#E67E22',
    '#1ABC9C',
    '#E74C3C',
    '#3498DB',
  ] as const;
  