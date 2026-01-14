import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('stat-card glow-effect animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label mb-2">{label}</p>
          <p
            className={cn('stat-value', {
              'text-primary': trend === 'positive',
              'text-destructive': trend === 'negative',
              'text-foreground': trend === 'neutral' || !trend,
            })}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
