import { TrendingUp, TrendingDown, PiggyBank, Trash2 } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  limit?: number;
}

export function TransactionList({ transactions, onDelete, showDelete = false, limit }: TransactionListProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-5 w-5" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-primary bg-primary/10';
      case 'expense':
        return 'text-destructive bg-destructive/10';
      case 'savings':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null;
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  if (displayTransactions.length === 0) {
    return (
      <div className="rounded-xl bg-card/50 border border-border p-8 text-center">
        <p className="text-muted-foreground">Brak transakcji</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTransactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className="transaction-row animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={cn('rounded-lg p-2', getTypeColor(transaction.type))}>
            {getIcon(transaction.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {transaction.person}
              </span>
              {transaction.category && (
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {getCategoryLabel(transaction.category)}
                </span>
              )}
            </div>
            {transaction.note && (
              <p className="text-sm text-muted-foreground truncate">{transaction.note}</p>
            )}
          </div>
          
          <div className="text-right">
            <p
              className={cn('font-mono font-semibold', {
                'text-primary': transaction.type === 'income',
                'text-destructive': transaction.type === 'expense',
                'text-warning': transaction.type === 'savings',
              })}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(Number(transaction.amount))}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
          </div>
          
          {showDelete && onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
