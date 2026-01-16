import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Target, Calendar, TrendingUp, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useGoals } from '@/hooks/useGoals';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GoalDetails() {
  const { id } = useParams<{ id: string }>();
  const { goals, savings, getGoalProgress, isLoading } = useGoals();

  const goal = goals.find((g) => g.id === id);
  const currentAmount = goal ? getGoalProgress(goal.id) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Monthly breakdown for this goal
  const monthlyData = useMemo(() => {
    if (!goal) return [];

    const goalSavings = savings.filter((s) => s.goal_id === goal.id);
    const monthlyTotals: Record<string, number> = {};

    goalSavings.forEach((s) => {
      const date = new Date(s.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(s.amount);
    });

    const sortedKeys = Object.keys(monthlyTotals).sort();
    
    return sortedKeys.map((key) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        name: date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' }),
        amount: monthlyTotals[key],
      };
    });
  }, [goal, savings]);

  // Calculate projection
  const projection = useMemo(() => {
    if (!goal || monthlyData.length === 0) return null;

    const remaining = goal.target_amount - currentAmount;
    if (remaining <= 0) {
      return { achieved: true, date: null, monthsRemaining: 0 };
    }

    // Calculate average monthly savings
    const totalMonths = monthlyData.length;
    const totalSaved = monthlyData.reduce((sum, m) => sum + m.amount, 0);
    const avgMonthly = totalSaved / totalMonths;

    if (avgMonthly <= 0) {
      return { achieved: false, date: null, monthsRemaining: Infinity };
    }

    const monthsRemaining = Math.ceil(remaining / avgMonthly);
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsRemaining);

    return {
      achieved: false,
      date: projectedDate,
      monthsRemaining,
      avgMonthly,
    };
  }, [goal, currentAmount, monthlyData]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!goal) {
    return (
      <AppLayout>
        <div className="container max-w-lg px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cel nie został znaleziony</p>
            <Link to="/goals" className="btn-primary mt-4 inline-block">
              Wróć do celów
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const percentage = Math.min((currentAmount / goal.target_amount) * 100, 100);

  return (
    <AppLayout>
      <div className="container max-w-lg px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/goals"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do celów
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{goal.name}</h1>
              <p className="text-sm text-muted-foreground">Szczegóły celu</p>
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="mb-6 rounded-xl bg-card border border-border p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Zebrano</p>
              <p className="text-3xl font-bold font-mono text-primary">
                {formatCurrency(currentAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cel</p>
              <p className="text-xl font-semibold font-mono">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>
          
          <div className="progress-bar h-4">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-center text-lg font-bold text-primary">
            {percentage.toFixed(1)}%
          </p>
        </div>

        {/* Projection */}
        {projection && (
          <div className="mb-6 rounded-xl bg-card border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              Prognoza osiągnięcia celu
            </h3>
            
            {projection.achieved ? (
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-lg font-bold text-primary">🎉 Cel osiągnięty!</p>
                <p className="text-sm text-muted-foreground">
                  Gratulacje! Udało Wam się zebrać całą kwotę.
                </p>
              </div>
            ) : projection.date ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Przewidywana data:</p>
                  <p className="text-xl font-bold">
                    {projection.date.toLocaleDateString('pl-PL', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    (za {projection.monthsRemaining} {projection.monthsRemaining === 1 ? 'miesiąc' : projection.monthsRemaining < 5 ? 'miesiące' : 'miesięcy'})
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Średnio miesięcznie odkładacie:</p>
                  <p className="text-lg font-bold font-mono text-primary">
                    {formatCurrency(projection.avgMonthly || 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Pozostało do zebrania:</p>
                  <p className="text-lg font-bold font-mono text-warning">
                    {formatCurrency(goal.target_amount - currentAmount)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-warning/10 p-4 text-center">
                <p className="text-muted-foreground">
                  Brak wystarczających danych do prognozy. Zacznijcie odkładać regularnie!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Monthly chart */}
        {monthlyData.length > 0 && (
          <div className="mb-6 rounded-xl bg-card border border-border p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Wpłaty miesięczne
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
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
                  <Bar dataKey="amount" name="Wpłata" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History */}
        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Calendar className="h-4 w-4 text-primary" />
            Historia wpłat
          </h3>
          {savings.filter((s) => s.goal_id === goal.id).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Brak wpłat</p>
          ) : (
            <div className="space-y-2">
              {savings
                .filter((s) => s.goal_id === goal.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(Number(s.amount))}</p>
                      {s.note && (
                        <p className="text-xs text-muted-foreground">{s.note}</p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(s.date).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
