import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useSales, useSalesPeriodSummary } from '@/hooks/useDashboardData';

interface Sale {
  Cod_Movime: number | string;
  Num_Docume: number | string;
  Num_NFCe: number | string;
  Dat_Emissa: string;
  Val_Movime: number;
}

type PresetKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'currentMonth' | 'clear';

export default function Sales() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const safePage = Math.max(1, page);

  const { data, isLoading } = useSales(startDate, endDate, safePage);
  const { data: summaryData, isLoading: isSummaryLoading } = useSalesPeriodSummary(startDate, endDate);

  const sales: Sale[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const finalPage = Math.min(safePage, totalPages);

  const quantidadeVendas = Number(summaryData?.quantidadeVendas || 0);
  const valorTotal = Number(summaryData?.valorTotal || 0);
  const ticketMedio = Number(summaryData?.ticketMedio || 0);

  const startItem = total === 0 ? 0 : (finalPage - 1) * 10 + 1;
  const endItem = Math.min(finalPage * 10, total);

  const formatInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getPresetRange = (preset: Exclude<PresetKey, 'clear'>) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    const end = new Date(today);

    if (preset === 'today') {
      return {
        startDate: formatInputDate(start),
        endDate: formatInputDate(end)
      };
    }

    if (preset === 'yesterday') {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);

      return {
        startDate: formatInputDate(start),
        endDate: formatInputDate(end)
      };
    }

    if (preset === 'last7') {
      start.setDate(start.getDate() - 6);

      return {
        startDate: formatInputDate(start),
        endDate: formatInputDate(end)
      };
    }

    if (preset === 'last30') {
      start.setDate(start.getDate() - 29);

      return {
        startDate: formatInputDate(start),
        endDate: formatInputDate(end)
      };
    }

    start.setDate(1);

    return {
      startDate: formatInputDate(start),
      endDate: formatInputDate(end)
    };
  };

  const applyPreset = (preset: PresetKey) => {
    if (preset === 'clear') {
      setStartDate('');
      setEndDate('');
      setPage(1);
      return;
    }

    const range = getPresetRange(preset);

    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setPage(1);
  };

  const isPresetActive = (preset: Exclude<PresetKey, 'clear'>) => {
    const range = getPresetRange(preset);

    return startDate === range.startDate && endDate === range.endDate;
  };

  const getPages = () => {
    const pages: number[] = [];
    const maxButtons = 5;

    let start = Math.max(1, finalPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const formatDate = (value: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('pt-BR', {
      timeZone: 'UTC'
    });
  };

  const formatCurrency = (value: number) => {
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Filtros */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Presets rápidos */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isPresetActive('today')
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={() => applyPreset('yesterday')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isPresetActive('yesterday')
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Ontem
              </button>

              <button
                type="button"
                onClick={() => applyPreset('last7')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isPresetActive('last7')
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Últimos 7 dias
              </button>

              <button
                type="button"
                onClick={() => applyPreset('last30')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isPresetActive('last30')
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Últimos 30 dias
              </button>

              <button
                type="button"
                onClick={() => applyPreset('currentMonth')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isPresetActive('currentMonth')
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Mês atual
              </button>

              <button
                type="button"
                onClick={() => applyPreset('clear')}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
              >
                Limpar
              </button>
            </div>

            {/* Inputs de data */}
            <div className="flex gap-4">
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 bg-white px-3 py-2 rounded-md text-sm"
              />

              <input
                id="endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 bg-white px-3 py-2 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Quantidade de vendas</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {isSummaryLoading ? '...' : quantidadeVendas}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Valor total</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {isSummaryLoading ? '...' : formatCurrency(valorTotal)}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Ticket médio</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {isSummaryLoading ? '...' : formatCurrency(ticketMedio)}
            </h3>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* Contador */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-semibold">{startItem}</span>–<span className="font-semibold">{endItem}</span> de <span className="font-semibold">{total}</span>
            </div>
          </div>

          {/* Scroll */}
          <div className="max-h-130 overflow-y-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-35" />
                <col className="w-35" />
                <col className="w-35" />
                <col className="w-35" />
              </colgroup>

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                    Registro
                  </th>

                  <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                    NFCE
                  </th>

                  <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-center font-semibold text-slate-700">
                    Data
                  </th>

                  <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-right font-semibold text-slate-700">
                    Valor
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Carregando...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Nenhuma venda encontrada para o período selecionado.
                    </td>
                  </tr>
                ) : (
                  sales.map((v) => (
                    <tr
                      key={`${v.Cod_Movime}-${v.Num_Docume}`}
                      className="border-b border-slate-100 odd:bg-white even:bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-left text-slate-700 truncate">
                        {v.Cod_Movime}
                      </td>

                      <td className="px-4 py-3 text-left text-slate-700 truncate">
                        {v.Num_Docume}
                      </td>

                      <td className="px-4 py-3 text-center text-slate-700">
                        {formatDate(v.Dat_Emissa)}
                      </td>

                      <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                        {formatCurrency(Number(v.Val_Movime || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setPage(1)}
              disabled={finalPage === 1}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {'<<'}
            </button>

            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={finalPage === 1}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {'<'}
            </button>

            {getPages().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  p === finalPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={finalPage === totalPages}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {'>'}
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={finalPage === totalPages}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {'>>'}
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}