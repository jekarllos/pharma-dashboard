import { useState } from "react";
import { useProducts } from "@/hooks/useDashboardData";
import DashboardLayout from "@/components/DashboardLayout";

interface Product {
  Cod_Produt: number | string;
  Des_Produt: string;
  Qtd_Fisico: number;
  Qtd_Solici: number;
}

export default function Inventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts(page, search);

  if (isLoading) return <div>Carregando produtos...</div>;

  const products: Product[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <input
          type="text"
          placeholder="Buscar medicamento..."
          className="border p-2 rounded w-full max-w-md"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Produto</th>
                <th className="p-3">Estoque</th>
                <th className="p-3">Reservado</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.Cod_Produt} className="border-t">
                  <td className="p-3">{p.Cod_Produt}</td>
                  <td className="p-3">{p.Des_Produt}</td>
                  <td className="p-3">{p.Qtd_Fisico}</td>
                  <td className="p-3">{p.Qtd_Solici}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-slate-200 rounded"
          >
            Anterior
          </button>

          <span>
            Página {page} de {totalPages || 1}
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-slate-200 rounded"
          >
            Próximo
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}