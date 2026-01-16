import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { BarChart3, LineChart as LineChartIcon, PieChart, TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type ChartType = 'line' | 'bar' | 'pie';
type ViewType = 'monthly' | 'yearly';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [viewType, setViewType] = useState<ViewType>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { transactions, isLoading } = useTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(selectedYear, i, 1);
      return {
        name: month.toLocaleDateString('pl-PL', { month: 'short' }),
        month: i,
        income: 0,
        expenses: 0,
        savings: 0,
        balance: 0,
      };
    });

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() === selectedYear) {
        const monthIndex = date.getMonth();
        const amount = Number(t.amount);
        
        if (t.type === 'income') {
          months[monthIndex].income += amount;
        } else if (t.type === 'expense') {
          months[monthIndex].expenses += amount;
        } else if (t.type === 'savings') {
          months[monthIndex].savings += amount;
        }
      }
    });

    months.forEach((m) => {
      m.balance = m.income - m.expenses - m.savings;
    });

    return months;
  }, [transactions, selectedYear]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const yearTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === selectedYear && t.type === 'expense';
    });

    const totals: Record<string, number> = {};
    yearTransactions.forEach((t) => {
      const cat = t.category || 'inne';
      totals[cat] = (totals[cat] || 0) + Number(t.amount);
    });

    return EXPENSE_CATEGORIES.map((cat, index) => ({
      name: cat.label,
      value: totals[cat.value] || 0,
      color: COLORS[index % COLORS.length],
    })).filter((item) => item.value > 0);
  }, [transactions, selectedYear]);

  // Year summary
  const yearSummary = useMemo(() => {
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const totalSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0);
    const totalBalance = totalIncome - totalExpenses - totalSavings;

    return { totalIncome, totalExpenses, totalSavings, totalBalance };
  }, [monthlyData]);

  // Month to month comparison
  const comparisonData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const current = monthlyData[currentMonth];
    const previous = currentMonth > 0 ? monthlyData[currentMonth - 1] : null;

    if (!previous) return null;

    return {
      incomeChange: current.income - previous.income,
      expenseChange: current.expenses - previous.expenses,
      savingsChange: current.savings - previous.savings,
    };
  }, [monthlyData]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, []);

  return (
    <AppLayout>
      <div className="container max-w-4xl px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Analityka</h1>
          <p className="text-sm text-muted-foreground">Wykresy i trendy finansowe</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary p-1">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Chart type */}
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            <button
              onClick={() => setChartType('line')}
              className={`rounded-md p-2 transition-colors ${
                chartType === 'line'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LineChartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`rounded-md p-2 transition-colors ${
                chartType === 'bar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`rounded-md p-2 transition-colors ${
                chartType === 'pie'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PieChart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Year summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="stat-card">
                <p className="stat-label">Wpływy {selectedYear}</p>
                <p className="stat-value text-xl text-primary">{formatCurrency(yearSummary.totalIncome)}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Wydatki {selectedYear}</p>
                <p className="stat-value text-xl text-destructive">{formatCurrency(yearSummary.totalExpenses)}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Oszczędności {selectedYear}</p>
                <p className="stat-value text-xl text-warning">{formatCurrency(yearSummary.totalSavings)}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Bilans {selectedYear}</p>
                <p className={`stat-value text-xl ${yearSummary.totalBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {formatCurrency(yearSummary.totalBalance)}
                </p>
              </div>
            </div>

            {/* Month comparison */}
            {comparisonData && (
              <div className="mb-6 rounded-xl bg-card border border-border p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Porównanie z poprzednim miesiącem
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Wpływy</p>
                    <p className={`font-mono font-semibold ${comparisonData.incomeChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {comparisonData.incomeChange >= 0 ? '+' : ''}{formatCurrency(comparisonData.incomeChange)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wydatki</p>
                    <p className={`font-mono font-semibold ${comparisonData.expenseChange <= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {comparisonData.expenseChange >= 0 ? '+' : ''}{formatCurrency(comparisonData.expenseChange)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Oszczędności</p>
                    <p className={`font-mono font-semibold ${comparisonData.savingsChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {comparisonData.savingsChange >= 0 ? '+' : ''}{formatCurrency(comparisonData.savingsChange)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main chart */}
            <div className="mb-6 rounded-xl bg-card border border-border p-4">
              <h3 className="mb-4 font-semibold">
                {chartType === 'pie' ? 'Wydatki wg kategorii' : 'Trend roczny'}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="income" name="Wpływy" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="expenses" name="Wydatki" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="savings" name="Oszczędności" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Wpływy" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Wydatki" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="savings" name="Oszczędności" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                    </RePieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly breakdown table */}
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Podsumowanie miesięczne
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Miesiąc</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Wpływy</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Wydatki</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Oszczędności</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Bilans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((m, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-primary">{formatCurrency(m.income)}</td>
                        <td className="px-4 py-3 text-right font-mono text-destructive">{formatCurrency(m.expenses)}</td>
                        <td className="px-4 py-3 text-right font-mono text-warning">{formatCurrency(m.savings)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${m.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {formatCurrency(m.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
