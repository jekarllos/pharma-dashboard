import { useState } from "react";
import { FiltroDeDatas } from "@/components/FiltroDeDatas";
import DashboardLayout from "@/components/DashboardLayout";
import { useSales, useSalesPeriodSummary } from "@/hooks/useDashboardData";
import ModalDetalhesVenda from "@/components/ModalDetalhesVenda";

interface Vendas {
  Cod_Movime: number | string;
  Num_Docume: number | string;
  Dat_Emissa: string;
  Val_Movime: number;
  status: "F" | "C";
}

export default function Sales() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const [geradorPDF, setGerandoPDF] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [vendaSelecionadaId, setVendaSelecionadaId] = useState<number | null>(
    null,
  );

  //const [todasVendas, setTodasVendas] = useState<Vendas[]>([]);//

  const safePage = Math.max(1, page);

  const { data, isLoading } = useSales(startDate, endDate, safePage);
  const { data: summaryData, isLoading: isSummaryLoading } =
    useSalesPeriodSummary(startDate, endDate);

  const sales: Vendas[] = data?.data || [];
  const total = data?.total || 0;
  // Filtrar vendas baseado no toggle
  const salesExibidas = sales;

  const totalExibido = total;
  const totalPagesExibido = Math.max(1, Math.ceil(totalExibido / 10));
  const finalPage = Math.min(safePage, totalPagesExibido);

  const quantidadeVendas = Number(summaryData?.quantidadeVendas || 0);
  const valorTotal = Number(summaryData?.valorTotal || 0);
  const ticketMedio = Number(summaryData?.ticketMedio || 0);
  const totalCanceladas = Number(summaryData?.totalCanceladas || 0);

  const startItem = totalExibido === 0 ? 0 : (finalPage - 1) * 10 + 1;
  const endItem = Math.min(finalPage * 10, totalExibido);

  const getPages = () => {
    const pages: number[] = [];
    const maxButtons = 5;

    let start = Math.max(1, finalPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPagesExibido) {
      end = totalPagesExibido;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

  const formatCurrency = (value: number) => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));
  };

  // Buscar todas as vendas do período (sem paginação)
  const buscarTodasVendas = async () => {
    if (!startDate || !endDate) return [];

    try {
      const response = await fetch(
        `http://localhost:3000/api/sales/all?startDate=${startDate}&endDate=${endDate}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar todas as vendas");
      }

      const data = await response.json();
      return data as Vendas[];
    } catch (error) {
      console.error("Erro ao buscar todas as vendas:", error);
      return [];
    }
  };

  // Função para gerar o PDF//
  const gerarRelatorioPDF = async () => {
    if (!startDate || !endDate) {
      alert("Selecione um período antes de gerar o relatório.");
      return;
    }

    setGerandoPDF(true);

    try {
      // Busca TODAS as vendas do período
      const vendasCompletas = await buscarTodasVendas();

      if (vendasCompletas.length === 0) {
        alert("Não há vendas no período selecionado para gerar o relatório.");
        setGerandoPDF(false);
        return;
      }

      // Importa as bibliotecas
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text("Relatório de Vendas", 14, 20);

      // Período
      doc.setFontSize(11);
      doc.text(
        `Período: ${formatDate(startDate)} a ${formatDate(endDate)}`,
        14,
        30,
      );
      doc.text(
        `Data de geração: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        37,
      );

      // Resumo
      doc.setFontSize(12);
      doc.text("Resumo:", 14, 48);
      doc.setFontSize(10);
      doc.text(`Quantidade de vendas: ${quantidadeVendas}`, 20, 56);
      doc.text(`Valor total: ${formatCurrency(valorTotal)}`, 20, 63);
      doc.text(`Ticket médio: ${formatCurrency(ticketMedio)}`, 20, 70);
      doc.text(`Canceladas: ${totalCanceladas}`, 20, 77);

      // Tabela de vendas com TODOS os registros
      const tableData = vendasCompletas.map((venda) => [
        venda.Cod_Movime.toString(),
        venda.Num_Docume.toString(),
        formatDate(venda.Dat_Emissa),
        formatCurrency(Number(venda.Val_Movime)),
        venda.status === "F" ? "Autorizada" : "Cancelada",
      ]);

      autoTable(doc, {
        startY: 85,
        head: [["Registro", "NFCE", "Data", "Valor", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
        },
      });

      // Adicionar total de registros no rodapé
      const finalY =
        (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable
          ?.finalY || 85;
      doc.setFontSize(9);
      doc.text(
        `Total de registros: ${vendasCompletas.length}`,
        14,
        finalY + 10,
      );

      // Abrir PDF em nova aba
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      // Liberar memória após 10 segundos
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Filtros */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-start">
            <FiltroDeDatas
              dataInicial={startDate}
              dataFinal={endDate}
              aoAlterar={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Quantidade de vendas
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {isSummaryLoading ? "..." : quantidadeVendas}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Valor total</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {isSummaryLoading ? "..." : formatCurrency(valorTotal)}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Ticket médio</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {isSummaryLoading ? "..." : formatCurrency(ticketMedio)}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Canceladas</p>
            <h3 className="mt-2 text-2xl font-bold text-red-600">
              {isSummaryLoading ? "..." : totalCanceladas}
            </h3>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Contador */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-semibold">{startItem}</span>–
              <span className="font-semibold">{endItem}</span> de{" "}
              <span className="font-semibold">{totalExibido}</span>
              {totalCanceladas > 0 && (
                <span className="ml-2 text-red-500">
                  ({totalCanceladas} canceladas)
                </span>
              )}
            </div>
            {/* Gerar PDF */}
            <div className="flex justify-end">
              <button
                onClick={gerarRelatorioPDF}
                disabled={geradorPDF || salesExibidas.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {geradorPDF ? <>⏳ Gerando PDF...</> : <>📄 PDF</>}
              </button>
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
                  <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-center font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-center font-semibold text-slate-700">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : salesExibidas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Nenhuma venda encontrada para o período selecionado.
                    </td>
                  </tr>
                ) : (
                  salesExibidas.map((v) => (
                    <tr
                      key={`${v.Cod_Movime}-${v.Num_Docume}`}
                      className={`border-b border-slate-100 odd:bg-white even:bg-slate-50/50 hover:bg-slate-50 transition-colors ${
                        v.status === "C" ? "bg-red-50/50 hover:bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-left text-slate-700 truncate">
                        {v.Cod_Movime}
                      </td>

                      <td className="px-4 py-3 text-left">
                        {v.status === "C" ? (
                          <span className="line-through text-gray-400">
                            {v.Num_Docume}
                          </span>
                        ) : (
                          <span className="text-slate-700">{v.Num_Docume}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center text-slate-700">
                        {formatDate(v.Dat_Emissa)}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-medium tabular-nums ${
                          v.status === "C"
                            ? "text-red-400 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {formatCurrency(Number(v.Val_Movime || 0))}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {v.status === "F" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ✅ Autorizada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            ❌ Cancelada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setVendaSelecionadaId(Number(v.Cod_Movime));
                            setModalAberto(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Ver detalhes"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                          </svg>
                        </button>
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
              {"<<"}
            </button>

            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={finalPage === 1}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {"<"}
            </button>

            {getPages().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  p === finalPage
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPagesExibido))
              }
              disabled={finalPage === totalPagesExibido}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {">"}
            </button>

            <button
              onClick={() => setPage(totalPagesExibido)}
              disabled={finalPage === totalPagesExibido}
              className="px-2 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              {">>"}
            </button>

            <span className="text-sm text-slate-400">
              {finalPage} de {totalPagesExibido} páginas
            </span>
          </div>
        </div>
      </div>
      <ModalDetalhesVenda
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setVendaSelecionadaId(null);
        }}
        vendaId={vendaSelecionadaId}
      />
    </DashboardLayout>
  );
}
