import { ComponentProps } from 'react'; 
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface SalesChartProps {
    data: {
        data: string;
        total: number;
    }[];
}

type TooltipFormatter = ComponentProps<typeof Tooltip>['formatter'];

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-75 w-full bg-white p-4 rounded-xl border">
      <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase">Tendência de Vendas (7 Dias)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 15 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 11}}            
            tickFormatter={(value) =>
              Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0
              }).format(Number(value))
            } 
          />
          
          <Tooltip 
            formatter={((value) => {
              const numericValue = typeof value === 'number' ? value : Number(value);
              const formatted = Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
              return [formatted, "Faturamento"];
            }) as TooltipFormatter}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          
          <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
