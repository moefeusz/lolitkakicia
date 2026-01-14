import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Goal, Transaction } from '@/lib/types';

export function useGoals() {
  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Goal[];
    },
  });

  const savingsQuery = useQuery({
    queryKey: ['goal-savings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'savings')
        .not('goal_id', 'is', null);

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const getGoalProgress = (goalId: string) => {
    const savings = savingsQuery.data ?? [];
    const goalSavings = savings.filter((s) => s.goal_id === goalId);
    return goalSavings.reduce((sum, s) => sum + Number(s.amount), 0);
  };

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading || savingsQuery.isLoading,
    error: goalsQuery.error || savingsQuery.error,
    getGoalProgress,
    savings: savingsQuery.data ?? [],
  };
}
