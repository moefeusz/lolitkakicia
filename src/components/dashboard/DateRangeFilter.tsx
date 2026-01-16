import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onChange: (start: Date | undefined, end: Date | undefined) => void;
}

export function DateRangeFilter({ startDate, endDate, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onChange(undefined, undefined);
  };

  const hasFilter = startDate || endDate;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              hasFilter && 'border-primary'
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {startDate && endDate ? (
              <span>
                {format(startDate, 'd MMM', { locale: pl })} - {format(endDate, 'd MMM', { locale: pl })}
              </span>
            ) : startDate ? (
              <span>Od {format(startDate, 'd MMM', { locale: pl })}</span>
            ) : endDate ? (
              <span>Do {format(endDate, 'd MMM', { locale: pl })}</span>
            ) : (
              <span>Zakres dat</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3 border-b border-border">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Od</p>
              <CalendarUI
                mode="single"
                selected={startDate}
                onSelect={(date) => onChange(date, endDate)}
                locale={pl}
                className="pointer-events-auto"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Do</p>
              <CalendarUI
                mode="single"
                selected={endDate}
                onSelect={(date) => onChange(startDate, date)}
                locale={pl}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {hasFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
