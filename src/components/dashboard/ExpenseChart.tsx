import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction, EXPENSE_CATEGORIES } from '@/lib/types';

interface ExpenseChartProps {
  transactions: Transaction[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat.value)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: cat.label,
      value: total,
    };
  }).filter((cat) => cat.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (categoryTotals.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="stat-label mb-4">Wydatki wg kategorii</h3>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Brak danych</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="stat-label mb-4">Wydatki wg kategorii</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryTotals}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {categoryTotals.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0];
                return (
                  <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-lg">
                    <p className="font-medium text-foreground">{data.name}</p>
                    <p className="text-primary font-mono">{formatCurrency(data.value as number)}</p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
