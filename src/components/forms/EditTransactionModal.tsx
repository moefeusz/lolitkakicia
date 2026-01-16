import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, ExpenseCategory, EXPENSE_CATEGORIES } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, isOpen, onClose }: EditTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('inne');
  const [subCategory, setSubCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category || 'inne');
      setSubCategory(transaction.sub_category || '');
      setDate(transaction.date);
      setNote(transaction.note || '');
    }
  }, [transaction]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !amount || Number(amount) <= 0) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: Number(amount),
          category: transaction.type === 'expense' ? category : null,
          sub_category: transaction.type === 'expense' ? subCategory || null : null,
          date,
          note: note || null,
        })
        .eq('id', transaction.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['goal-savings'] });
      toast.success('Transakcja zaktualizowana!');
      handleClose();
    } catch (error) {
      toast.error('Błąd przy aktualizacji transakcji');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-md animate-slide-up rounded-t-2xl sm:rounded-2xl bg-card border border-border p-6 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="mb-6 text-xl font-bold">Edytuj transakcję</h2>

          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Kwota (PLN)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field text-2xl font-mono font-bold"
                autoFocus
                required
              />
            </div>

            {/* Category - only for expenses */}
            {transaction.type === 'expense' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Kategoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        category === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-category - only for expenses */}
            {transaction.type === 'expense' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Podkategoria (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="np. prąd, internet..."
                  className="input-field"
                />
              </div>
            )}

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Note */}
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Notatka (opcjonalnie)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dodaj opis..."
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating || !amount || Number(amount) <= 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
