import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddTransactionModal } from '@/components/forms/AddTransactionModal';
import { useTransactions } from '@/hooks/useTransactions';
import { PERSONS, PersonType } from '@/lib/types';

export default function Income() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [personFilter, setPersonFilter] = useState<PersonType | 'all'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { transactions, isLoading, deleteTransaction } = useTransactions(month, year);

  const incomeTransactions = transactions
    .filter((t) => t.type === 'income')
    .filter((t) => personFilter === 'all' || t.person === personFilter)
    .filter((t) => {
      if (!startDate && !endDate) return true;
      const txDate = new Date(t.date);
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    });

  const total = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="container max-w-lg px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Wpływy</h1>
          <p className="text-sm text-muted-foreground">
            Suma: <span className="font-mono font-semibold text-primary">{formatCurrency(total)}</span>
          </p>
        </div>

        {/* Month Selector */}
        <div className="mb-4">
          <MonthSelector
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
        </div>

        {/* Date Range Filter */}
        <div className="mb-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        {/* Person Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setPersonFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              personFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Wszyscy
          </button>
          {PERSONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPersonFilter(p.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                personFilter === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <TransactionList
            transactions={incomeTransactions}
            onDelete={deleteTransaction}
            showDelete
            showEdit
          />
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
          defaultType="income"
        />
      </div>
    </AppLayout>
  );
}
