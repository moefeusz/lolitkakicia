import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, ExpenseCategory, PersonType } from '@/lib/types';
import { toast } from 'sonner';

interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category?: ExpenseCategory | null;
  sub_category?: string | null;
  person: PersonType;
  date: string;
  note?: string | null;
  goal_id?: string | null;
}

export function useTransactions(month?: number, year?: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', month, year],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: input.type,
          amount: input.amount,
          category: input.category || null,
          sub_category: input.sub_category || null,
          person: input.person,
          date: input.date,
          note: input.note || null,
          goal_id: input.goal_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transakcja dodana!');
    },
    onError: (error) => {
      toast.error('Błąd przy dodawaniu transakcji');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transakcja usunięta');
    },
    onError: (error) => {
      toast.error('Błąd przy usuwaniu transakcji');
      console.error(error);
    },
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTransaction: createMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
