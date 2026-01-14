export type TransactionType = 'income' | 'expense' | 'savings';
export type ExpenseCategory = 'rachunki' | 'kredyty' | 'raty' | 'jedzenie' | 'inne';
export type PersonType = 'Konki' | 'Ania';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: ExpenseCategory | null;
  sub_category: string | null;
  person: PersonType;
  date: string;
  note: string | null;
  goal_id: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  currency: string;
  created_at: string;
}

export interface MonthFilter {
  month: number;
  year: number;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'rachunki', label: 'Rachunki' },
  { value: 'kredyty', label: 'Kredyty' },
  { value: 'raty', label: 'Raty' },
  { value: 'jedzenie', label: 'Jedzenie' },
  { value: 'inne', label: 'Inne' },
];

export const PERSONS: { value: PersonType; label: string }[] = [
  { value: 'Konki', label: 'Konki' },
  { value: 'Ania', label: 'Ania' },
];

export const FIXED_EXPENSE_CATEGORIES: ExpenseCategory[] = ['rachunki', 'kredyty', 'raty'];
