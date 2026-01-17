import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonthData {
  name: string;
  income: number;
  expenses: number;
  savings: number;
  balance: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface AnalysisRequest {
  monthlyData: MonthData[];
  categoryData: CategoryData[];
  selectedMonths: string[];
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { monthlyData, categoryData, selectedMonths, totalIncome, totalExpenses, totalSavings }: AnalysisRequest = await req.json();

    const prompt = `Jesteś ekspertem finansowym. Przeanalizuj poniższe dane finansowe i napisz zwięzłą analizę po polsku.

WYBRANE MIESIĄCE: ${selectedMonths.join(', ')}

DANE MIESIĘCZNE:
${monthlyData.map(m => `${m.name}: Wpływy ${m.income} PLN, Wydatki ${m.expenses} PLN, Oszczędności ${m.savings} PLN, Bilans ${m.balance} PLN`).join('\n')}

WYDATKI WG KATEGORII:
${categoryData.map(c => `${c.name}: ${c.value} PLN`).join('\n')}

PODSUMOWANIE:
- Suma wpływów: ${totalIncome} PLN
- Suma wydatków: ${totalExpenses} PLN
- Suma oszczędności: ${totalSavings} PLN
- Bilans: ${totalIncome - totalExpenses - totalSavings} PLN

Odpowiedz w formacie JSON:
{
  "trendAnalysis": "Krótki opis trendu (2-3 zdania) - czy finanse się poprawiają, pogarszają, są stabilne",
  "topInsights": ["Wgląd 1", "Wgląd 2", "Wgląd 3"],
  "suggestions": ["Sugestia 1", "Sugestia 2", "Sugestia 3"],
  "riskLevel": "niski" | "średni" | "wysoki",
  "savingsRate": "X%" (procent oszczędności względem wpływów),
  "biggestExpenseCategory": "nazwa kategorii",
  "monthlyTrend": "rosnący" | "malejący" | "stabilny"
}

Bądź konkretny, używaj liczb z danych. Pisz zwięźle ale merytorycznie.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-finances:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
