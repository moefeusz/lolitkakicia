import { useState } from 'react';
import { Plus, Target, TrendingUp, Trash2, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddTransactionModal } from '@/components/forms/AddTransactionModal';
import { AddGoalModal } from '@/components/forms/AddGoalModal';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function Goals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const { goals, getGoalProgress, savings, isLoading } = useGoals();
  const { deleteTransaction } = useTransactions();
  const queryClient = useQueryClient();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalSaved = savings.reduce((sum, s) => sum + Number(s.amount), 0);

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten cel? Wpłaty pozostaną w historii.')) return;

    try {
      // First, unlink savings from this goal
      await supabase
        .from('transactions')
        .update({ goal_id: null })
        .eq('goal_id', goalId);

      // Then delete the goal
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-savings'] });
      toast.success('Cel usunięty');
    } catch (error) {
      toast.error('Błąd przy usuwaniu celu');
      console.error(error);
    }
  };

  const handleDeleteSaving = (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę wpłatę?')) return;
    deleteTransaction(id);
    queryClient.invalidateQueries({ queryKey: ['goal-savings'] });
  };

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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Target className="h-5 w-5 text-primary" />
                  Twoje cele
                </h2>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Nowy cel
                </button>
              </div>
              {goals.length === 0 ? (
                <div className="rounded-xl bg-card/50 border border-border p-8 text-center">
                  <p className="text-muted-foreground">Brak zdefiniowanych celów</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="relative group">
                      <Link to={`/goals/${goal.id}`}>
                        <GoalProgress
                          goal={goal}
                          currentAmount={getGoalProgress(goal.id)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteGoal(goal.id);
                        }}
                        className="absolute right-12 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                showDelete
                showEdit
                onDelete={handleDeleteSaving}
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

        {/* Add Goal Modal */}
        <AddGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
