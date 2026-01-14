import { Target } from 'lucide-react';
import { Goal } from '@/lib/types';

interface GoalProgressProps {
  goal: Goal;
  currentAmount: number;
}

export function GoalProgress({ goal, currentAmount }: GoalProgressProps) {
  const percentage = Math.min((currentAmount / goal.target_amount) * 100, 100);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="stat-card animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{goal.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(currentAmount)} z {formatCurrency(goal.target_amount)}
          </p>
        </div>
        <span className="font-mono text-lg font-bold text-primary">
          {percentage.toFixed(0)}%
        </span>
      </div>
      
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
