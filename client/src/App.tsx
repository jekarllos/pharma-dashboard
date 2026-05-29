import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import { SalesChart } from "./components/SalesChart";
import {
  useSalesSummary,
  useSalesTrend,
  useCriticalInventory,
} from "./hooks/useDashboardData";
import Inventory from "./pages/Inventory";
import { Toaster } from "@/components/ui/sonner";
import Sales from "./pages/Sales";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

interface Product {
  id: string | number;
  name: string;
  stock: number;
}

function DashboardHome() {
  const { data: summaryData, isLoading: isSummaryLoading } = useSalesSummary();
  const { data: trendData, isLoading: isTrendLoading } = useSalesTrend();
  const { data: inventoryData, isLoading: isInventoryLoading } =
    useCriticalInventory();

  if (isSummaryLoading || isTrendLoading || isInventoryLoading) {
    return (
      <div className="p-6 text-slate-500 text-center">
        Carregando dados do VMD...
      </div>
    );
  }

  const totalVendas = summaryData?.totalVendas ?? 0;
  const faturamentoDiario = summaryData?.faturamentoDiario ?? 0;
  const listTrend = trendData ?? [];
  const listCritical = inventoryData ?? [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500 uppercase font-bold">
              Vendas Hoje
            </p>
            <h3 className="text-3xl font-bold mt-2 text-slate-800">
              {totalVendas}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500">
            <p className="text-sm text-slate-500 uppercase font-bold">
              Faturamento
            </p>
            <h3 className="text-3xl font-bold mt-2 text-slate-800">
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(faturamentoDiario)}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesChart data={listTrend} />
          </div>

          <div className="bg-white p-4 rounded-xl border flex flex-col">
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase">
              Estoque Crítico (TOP 5)
            </h3>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {listCritical.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhum produto crítico encontrado.
                </p>
              ) : (
                listCritical.map((item: Product) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>

                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        item.stock <= 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.stock} un
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
