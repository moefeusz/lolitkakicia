import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, Banknote } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { AddTransactionModal } from '@/components/forms/AddTransactionModal';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { FIXED_EXPENSE_CATEGORIES } from '@/lib/types';

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { transactions, isLoading } = useTransactions(month, year);
  const { goals, getGoalProgress } = useGoals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = transactions
    .filter((t) => t.type === 'savings')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses - savings;

  const fixedExpenses = transactions
    .filter((t) => t.type === 'expense' && t.category && FIXED_EXPENSE_CATEGORIES.includes(t.category))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const afterFixed = income - fixedExpenses - savings;

  return (
    <AppLayout>
      <div className="container max-w-lg px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Wspólne finanse</p>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <MonthSelector
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <StatCard
                label="Wpływy"
                value={formatCurrency(income)}
                icon={<TrendingUp className="h-5 w-5" />}
                trend="positive"
              />
              <StatCard
             label="Wydatki"
                value={formatCurrency(expenses)}
                icon={<TrendingDown className="h-5 w-5" />}
                trend="negative"
                      />
    {/* 
 * Removed the savings card from the dashboard.  The dashboard now
 * focuses on income, expenses and overall balance only.
 */}}

    
              <StatCard
                label="Bilans"
                value={formatCurrency(balance)}
                icon={<Wallet className="h-5 w-5" />}
                trend={balance >= 0 ? 'positive' : 'negative'}
              />
            </div>

            {/* After Fixed */}
            <div className="mb-6">
              <StatCard
                label="Po stałych zobowiązaniach"
                value={formatCurrency(afterFixed)}
                icon={<Banknote className="h-5 w-5" />}
                trend={afterFixed >= 0 ? 'positive' : 'negative'}
                className="border-primary/30"
              />
            </div>

            {/* Expense Chart */}
            <div className="mb-6">
              <ExpenseChart transactions={transactions} />
            </div>

            {/* Goals */}
            {goals.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Cele oszczędnościowe</h2>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <GoalProgress
                      key={goal.id}
                      goal={goal}
                      currentAmount={getGoalProgress(goal.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Ostatnie transakcje</h2>
              <TransactionList transactions={transactions} limit={10} />
            </div>
          </>
        )}

        {/* FAB */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fab-button"
        >
          <Plus className="h-6 w-6 text-primary-foreground" />
        </button>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
