import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !targetAmount) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Podaj poprawną kwotę');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('goals').insert({
        name: name.trim(),
        target_amount: amount,
        currency: 'PLN',
      });

      if (error) throw error;

      toast.success('Cel dodany!');
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setName('');
      setTargetAmount('');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Błąd przy dodawaniu celu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setTargetAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Nowy cel oszczędnościowy</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Nazwa celu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Wakacje, Nowy laptop..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Kwota docelowa
            </label>
            <div className="relative">
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                PLN
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Dodawanie...' : 'Dodaj cel'}
          </button>
        </form>
      </div>
    </div>
  );
}
