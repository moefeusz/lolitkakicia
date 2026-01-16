import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { TransactionType, ExpenseCategory, EXPENSE_CATEGORIES } from '@/lib/types';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export function AddTransactionModal({ isOpen, onClose, defaultType }: AddTransactionModalProps) {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [type, setType] = useState<TransactionType>(defaultType || 'expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('inne');
  const [subCategory, setSubCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const { createTransaction, isCreating } = useTransactions();
  const { goals } = useGoals();

  const resetForm = () => {
    setStep('type');
    setAmount('');
    setCategory('inne');
    setSubCategory('');
    setNote('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeSelect = (selectedType: TransactionType) => {
    setType(selectedType);
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) return;

    if (type === 'savings') {
      // Auto-split 50/50 between goals
      const halfAmount = Number(amount) / 2;
      
      goals.forEach((goal) => {
        createTransaction({
          type: 'savings',
          amount: halfAmount,
          category: null,
          sub_category: null,
          person: 'Konki', // Default person
          date,
          note: note ? `${note} (${goal.name})` : goal.name,
          goal_id: goal.id,
        });
      });
    } else {
      createTransaction({
        type,
        amount: Number(amount),
        category: type === 'expense' ? category : null,
        sub_category: type === 'expense' ? subCategory || null : null,
        person: 'Konki', // Default person
        date,
        note: note || null,
        goal_id: null,
      });
    }

    handleClose();
  };

  if (!isOpen) return null;

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

        {step === 'type' ? (
          <>
            <h2 className="mb-6 text-xl font-bold">Dodaj transakcję</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleTypeSelect('income')}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary p-4 transition-all hover:border-primary hover:bg-primary/10"
              >
                <div className="rounded-full bg-primary/20 p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium">Wpływ</span>
              </button>
              
              <button
                onClick={() => handleTypeSelect('expense')}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary p-4 transition-all hover:border-destructive hover:bg-destructive/10"
              >
                <div className="rounded-full bg-destructive/20 p-3">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <span className="font-medium">Wydatek</span>
              </button>
              
              <button
                onClick={() => handleTypeSelect('savings')}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary p-4 transition-all hover:border-warning hover:bg-warning/10"
              >
                <div className="rounded-full bg-warning/20 p-3">
                  <Target className="h-6 w-6 text-warning" />
                </div>
                <span className="font-medium">Cel</span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
              >
                ←
              </button>
              <h2 className="text-xl font-bold">
                {type === 'income' && 'Nowy wpływ'}
                {type === 'expense' && 'Nowy wydatek'}
                {type === 'savings' && 'Wpłata na cel'}
              </h2>
            </div>

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
              {type === 'expense' && (
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
              {type === 'expense' && (
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

              {/* Info about auto-split for savings */}
              {type === 'savings' && goals.length > 0 && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <p className="text-sm text-muted-foreground">
                    💡 Kwota zostanie automatycznie podzielona 50/50 między cele:
                  </p>
                  <ul className="mt-1 text-sm font-medium text-foreground">
                    {goals.map((goal) => (
                      <li key={goal.id}>• {goal.name}</li>
                    ))}
                  </ul>
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
                disabled={isCreating || !amount || Number(amount) <= 0}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isCreating ? 'Dodawanie...' : 'Dodaj transakcję'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
