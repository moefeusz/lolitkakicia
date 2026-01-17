import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2
} from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ChartType = 'line' | 'bar' | 'pie';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MONTHS = [
  { value: 0, label: 'Sty' },
  { value: 1, label: 'Lut' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Kwi' },
  { value: 4, label: 'Maj' },
  { value: 5, label: 'Cze' },
  { value: 6, label: 'Lip' },
  { value: 7, label: 'Sie' },
  { value: 8, label: 'Wrz' },
  { value: 9, label: 'Paź' },
  { value: 10, label: 'Lis' },
  { value: 11, label: 'Gru' },
];

interface AIAnalysis {
  trendAnalysis: string;
  topInsights: string[];
  suggestions: string[];
  riskLevel: 'niski' | 'średni' | 'wysoki';
  savingsRate: string;
  biggestExpenseCategory: string;
  monthlyTrend: 'rosnący' | 'malejący' | 'stabilny';
}

export default function Analytics() {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([
    new Date().getMonth(),
    Math.max(0, new Date().getMonth() - 1),
    Math.max(0, new Date().getMonth() - 2),
    Math.max(0, new Date().getMonth() - 3),
  ].sort((a, b) => a - b));
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { transactions, isLoading } = useTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthIndex)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter(m => m !== monthIndex);
      }
      return [...prev, monthIndex].sort((a, b) => a - b);
    });
    setAiAnalysis(null); // Reset analysis when selection changes
  };

  // All monthly data for the year
  const allMonthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(selectedYear, i, 1);
      return {
        name: month.toLocaleDateString('pl-PL', { month: 'short' }),
        fullName: month.toLocaleDateString('pl-PL', { month: 'long' }),
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

  // Filtered data based on selected months
  const filteredMonthlyData = useMemo(() => {
    return allMonthlyData.filter(m => selectedMonths.includes(m.month));
  }, [allMonthlyData, selectedMonths]);

  // Category breakdown for selected months
  const categoryData = useMemo(() => {
    const selectedTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === selectedYear && 
             selectedMonths.includes(date.getMonth()) && 
             t.type === 'expense';
    });

    const totals: Record<string, number> = {};
    selectedTransactions.forEach((t) => {
      const cat = t.category || 'inne';
      totals[cat] = (totals[cat] || 0) + Number(t.amount);
    });

    return EXPENSE_CATEGORIES.map((cat, index) => ({
      name: cat.label,
      value: totals[cat.value] || 0,
      color: COLORS[index % COLORS.length],
    })).filter((item) => item.value > 0);
  }, [transactions, selectedYear, selectedMonths]);

  // Summary for selected months
  const summary = useMemo(() => {
    const totalIncome = filteredMonthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = filteredMonthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const totalSavings = filteredMonthlyData.reduce((sum, m) => sum + m.savings, 0);
    const totalBalance = totalIncome - totalExpenses - totalSavings;
    const avgMonthlyExpense = totalExpenses / (filteredMonthlyData.length || 1);
    const avgMonthlyIncome = totalIncome / (filteredMonthlyData.length || 1);

    return { totalIncome, totalExpenses, totalSavings, totalBalance, avgMonthlyExpense, avgMonthlyIncome };
  }, [filteredMonthlyData]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, []);

  const handleAnalyze = async () => {
    if (filteredMonthlyData.length === 0) {
      toast.error('Wybierz przynajmniej jeden miesiąc');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-finances', {
        body: {
          monthlyData: filteredMonthlyData,
          categoryData,
          selectedMonths: filteredMonthlyData.map(m => m.fullName),
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          totalSavings: summary.totalSavings,
        },
      });

      if (error) throw error;
      setAiAnalysis(data);
      toast.success('Analiza zakończona!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Błąd podczas analizy');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'niski': return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'średni': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'wysoki': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rosnący': return <ArrowUp className="h-4 w-4 text-primary" />;
      case 'malejący': return <ArrowDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl px-4 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Analityka</h1>
          <p className="text-sm text-muted-foreground">Wybierz miesiące i analizuj trendy z AI</p>
        </div>

        {/* Year selector */}
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary p-1 w-fit">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setAiAnalysis(null);
                }}
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
        </div>

        {/* Month selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-2">Wybierz miesiące do analizy:</p>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((month) => (
              <button
                key={month.value}
                onClick={() => toggleMonth(month.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  selectedMonths.includes(month.value)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                {month.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Wybrano: {selectedMonths.length} {selectedMonths.length === 1 ? 'miesiąc' : selectedMonths.length < 5 ? 'miesiące' : 'miesięcy'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="stat-card">
                <p className="stat-label">Wpływy</p>
                <p className="stat-value text-lg text-primary">{formatCurrency(summary.totalIncome)}</p>
                <p className="text-xs text-muted-foreground">śr. {formatCurrency(summary.avgMonthlyIncome)}/mies.</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Wydatki</p>
                <p className="stat-value text-lg text-destructive">{formatCurrency(summary.totalExpenses)}</p>
                <p className="text-xs text-muted-foreground">śr. {formatCurrency(summary.avgMonthlyExpense)}/mies.</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Oszczędności</p>
                <p className="stat-value text-lg text-warning">{formatCurrency(summary.totalSavings)}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Bilans</p>
                <p className={`stat-value text-lg ${summary.totalBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {formatCurrency(summary.totalBalance)}
                </p>
              </div>
            </div>

            {/* AI Analysis Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mb-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3 px-4 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analizuję...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generuj analizę AI dla wybranych miesięcy
                </>
              )}
            </button>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="mb-6 space-y-4">
                {/* Trend Analysis */}
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Analiza trendu</h3>
                      <p className="text-sm text-muted-foreground">{aiAnalysis.trendAnalysis}</p>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-card border border-border p-3 text-center">
                    <div className="flex justify-center mb-1">
                      {getRiskIcon(aiAnalysis.riskLevel)}
                    </div>
                    <p className="text-xs text-muted-foreground">Ryzyko</p>
                    <p className="font-semibold capitalize">{aiAnalysis.riskLevel}</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3 text-center">
                    <div className="flex justify-center mb-1">
                      {getTrendIcon(aiAnalysis.monthlyTrend)}
                    </div>
                    <p className="text-xs text-muted-foreground">Trend</p>
                    <p className="font-semibold capitalize">{aiAnalysis.monthlyTrend}</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3 text-center">
                    <p className="text-lg font-bold text-primary">{aiAnalysis.savingsRate}</p>
                    <p className="text-xs text-muted-foreground">Stopa oszczędności</p>
                  </div>
                </div>

                {/* Insights */}
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Kluczowe wnioski
                  </h3>
                  <ul className="space-y-2">
                    {aiAnalysis.topInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Sugestie
                  </h3>
                  <ul className="space-y-2">
                    {aiAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">→</span>
                        <span className="text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Chart type selector */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Wykres:</span>
              <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`rounded-md p-2 transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Słupkowy"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`rounded-md p-2 transition-colors ${
                    chartType === 'line'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Liniowy"
                >
                  <LineChartIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`rounded-md p-2 transition-colors ${
                    chartType === 'pie'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Kołowy"
                >
                  <PieChart className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main chart */}
            <div className="mb-6 rounded-xl bg-card border border-border p-4">
              <h3 className="mb-4 font-semibold">
                {chartType === 'pie' ? 'Wydatki wg kategorii' : 'Porównanie wybranych miesięcy'}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={filteredMonthlyData}>
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
                      <Line type="monotone" dataKey="income" name="Wpływy" stroke="#22c55e" strokeWidth={2} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="expenses" name="Wydatki" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="savings" name="Oszczędności" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} />
                    </LineChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={filteredMonthlyData}>
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
                  Szczegóły wybranych miesięcy
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
                    {filteredMonthlyData.map((m, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium">{m.fullName}</td>
                        <td className="px-4 py-3 text-right font-mono text-primary">{formatCurrency(m.income)}</td>
                        <td className="px-4 py-3 text-right font-mono text-destructive">{formatCurrency(m.expenses)}</td>
                        <td className="px-4 py-3 text-right font-mono text-warning">{formatCurrency(m.savings)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${m.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {formatCurrency(m.balance)}
                        </td>
                      </tr>
                    ))}
                    {/* Summary row */}
                    <tr className="bg-secondary/50 font-semibold">
                      <td className="px-4 py-3">SUMA</td>
                      <td className="px-4 py-3 text-right font-mono text-primary">{formatCurrency(summary.totalIncome)}</td>
                      <td className="px-4 py-3 text-right font-mono text-destructive">{formatCurrency(summary.totalExpenses)}</td>
                      <td className="px-4 py-3 text-right font-mono text-warning">{formatCurrency(summary.totalSavings)}</td>
                      <td className={`px-4 py-3 text-right font-mono ${summary.totalBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(summary.totalBalance)}
                      </td>
                    </tr>
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
