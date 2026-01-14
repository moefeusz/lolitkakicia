import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const goToPrevMonth = () => {
    if (month === 0) {
      onChange(11, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      onChange(0, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    onChange(now.getMonth(), now.getFullYear());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return month === now.getMonth() && year === now.getFullYear();
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
      <button
        onClick={goToPrevMonth}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <button
        onClick={goToCurrentMonth}
        className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-secondary"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-semibold">
          {MONTH_NAMES[month]} {year}
        </span>
        {!isCurrentMonth() && (
          <span className="text-xs text-muted-foreground">(wróć do dziś)</span>
        )}
      </button>
      
      <button
        onClick={goToNextMonth}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
