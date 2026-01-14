import { useState } from 'react';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddTransactionModal } from '@/components/forms/AddTransactionModal';
import { useGoals } from '@/hooks/useGoals';

export default function Goals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { goals, getGoalProgress, savings, isLoading } = useGoals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalSaved = savings.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <AppLayout>
      <div className="container max-w-lg px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cele oszczędnościowe</h1>
          <p className="text-sm text-muted-foreground">
            Suma zaoszczędzona: <span className="font-mono font-semibold text-primary">{formatCurrency(totalSaved)}</span>
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Goals */}
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Twoje cele
              </h2>
              {goals.length === 0 ? (
                <div className="rounded-xl bg-card/50 border border-border p-8 text-center">
                  <p className="text-muted-foreground">Brak zdefiniowanych celów</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <GoalProgress
                      key={goal.id}
                      goal={goal}
                      currentAmount={getGoalProgress(goal.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Savings History */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Historia wpłat
              </h2>
              <TransactionList
                transactions={savings.sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                )}
              />
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
          defaultType="savings"
        />
      </div>
    </AppLayout>
  );
}
