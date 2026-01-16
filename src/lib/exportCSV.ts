import { Transaction } from './types';

export function exportTransactionsToCSV(transactions: Transaction[], filename: string = 'transakcje') {
  const headers = ['Data', 'Typ', 'Kwota', 'Kategoria', 'Podkategoria', 'Osoba', 'Notatka'];
  
  const typeLabels: Record<string, string> = {
    income: 'Wpływ',
    expense: 'Wydatek',
    savings: 'Oszczędność',
  };

  const rows = transactions.map((t) => [
    t.date,
    typeLabels[t.type] || t.type,
    t.amount.toString(),
    t.category || '',
    t.sub_category || '',
    t.person,
    t.note || '',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
  ].join('\n');

  // Add BOM for Polish characters support in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
