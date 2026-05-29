import { useState, useEffect } from "react";

interface ItemVenda {
  codigoProduto: number;
  quantidade: number;
  sequencia: number;
  precoUnitario: number;
  percentualDesconto: number;
  valorDesconto: number;
  valorLiquido: number;
  itemCancelado: number;
  descricaoProduto: string;
}

interface VendaDetalhes {
  id: number;
  nfce: string;
  data: string;
  valorTotal: number;
  status: "F" | "C";
  codigoLoja: number;
  modeloDocumento: number;
  itens: ItemVenda[];
}

interface ModalDetalhesVendaProps {
  isOpen: boolean;
  onClose: () => void;
  vendaId: number | null;
}

export default function ModalDetalhesVenda({
  isOpen,
  onClose,
  vendaId,
}: ModalDetalhesVendaProps) {
  const [detalhes, setDetalhes] = useState<VendaDetalhes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && vendaId) {
      buscarDetalhesVenda();
    }
  }, [isOpen, vendaId]);

  const buscarDetalhesVenda = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/sales/${vendaId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar detalhes da venda");
      }

      const data = await response.json();
      setDetalhes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

  const formatStatus = (status: "F" | "C") => {
    return status === "F" ? "Autorizada" : "Cancelada";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            Detalhes da Venda
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="text-center py-8 text-slate-500">
              Carregando detalhes...
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {detalhes && !loading && !error && (
            <>
              {/* Dados da venda */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500">Registro</p>
                  <p className="text-sm font-medium text-slate-800">
                    {detalhes.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">NFCE</p>
                  <p className="text-sm font-medium text-slate-800">
                    {detalhes.nfce}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(detalhes.data)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      detalhes.status === "F"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {formatStatus(detalhes.status)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Loja</p>
                  <p className="text-sm font-medium text-slate-800">
                    {detalhes.codigoLoja}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Modelo do Documento</p>
                  <p className="text-sm font-medium text-slate-800">
                    {detalhes.modeloDocumento}
                  </p>
                </div>
              </div>

              {/* Itens da venda */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Produtos
                </p>

                {detalhes.itens.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhum produto encontrado
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                            Produto
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">
                            Qtd
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                            Unitário
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detalhes.itens.map((item) => (
                          <tr key={item.sequencia}>
                            <td className="px-3 py-2 text-slate-700">
                              <div className="font-medium">
                                {item.descricaoProduto}
                              </div>
                              <div className="text-xs text-slate-400">
                                Cód: {item.codigoProduto}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center text-slate-700">
                              {item.quantidade}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {formatCurrency(item.precoUnitario)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-800">
                              {formatCurrency(item.valorLiquido)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-2 text-right font-semibold text-slate-700"
                          >
                            Total da venda:
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-800">
                            {formatCurrency(detalhes.valorTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
