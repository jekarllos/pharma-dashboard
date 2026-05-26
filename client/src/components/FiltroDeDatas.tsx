import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  dataInicial: string;
  dataFinal: string;
  aoAlterar: (inicio: string, fim: string) => void;
}

export function FiltroDeDatas({ dataInicial, dataFinal, aoAlterar }: Props) {
  const [localStart, setLocalStart] = useState(dataInicial);
  const [localEnd, setLocalEnd] = useState(dataFinal);
  const [aberto, setAberto] = useState(false);
  const [presetAtivo, setPresetAtivo] = useState<string | null>(null);

  function applyFilter() {
    aoAlterar(localStart, localEnd);
    setAberto(false);
  }

  function resetFilter() {
    setLocalStart("");
    setLocalEnd("");
    aoAlterar("", "");
  }

  function formatarData(data: string) {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function getDataLocal() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().slice(0, 10);
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className="bg-white border border-slate-200 hover:bg-slate-200 transition-all duration-200"
        >
          {dataInicial && dataFinal
            ? `${formatarData(dataInicial)} - ${formatarData(dataFinal)}`
            : "Selecionar período"}
        </Button>
      </PopoverTrigger>

      {/* Adicionado bg-white, shadow-lg, z-50 e largura arbitrária w-[480px] */}
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-120 p-0 flex bg-white shadow-lg border border-slate-200 rounded-md overflow-visible"
      >
        {/* presets */}
        <div className="w-40 border-r border-slate-200 p-3 space-y-1 bg-slate-50">
          <button
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              presetAtivo === "hoje"
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => {
              const today = getDataLocal();
              setLocalStart(today);
              setLocalEnd(today);
              setPresetAtivo("hoje");
            }}
          >
            Hoje
          </button>

          <button
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              presetAtivo === "ontem"
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              const y = d.toISOString().slice(0, 10);
              setLocalStart(y);
              setLocalEnd(y);
              setPresetAtivo("ontem");
            }}
          >
            Ontem
          </button>

          <button
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              presetAtivo === "7dias"
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => {
              const d = new Date();
              const end = d.toISOString().slice(0, 10);
              d.setDate(d.getDate() - 6);
              const start = d.toISOString().slice(0, 10);
              setLocalStart(start);
              setLocalEnd(end);
              setPresetAtivo("7dias");
            }}
          >
            Últimos 7 dias
          </button>

          <button
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              presetAtivo === "30dias"
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => {
              const d = new Date();
              const end = d.toISOString().slice(0, 10);
              d.setDate(d.getDate() - 29);
              const start = d.toISOString().slice(0, 10);
              setLocalStart(start);
              setLocalEnd(end);
              setPresetAtivo("30dias");
            }}
          >
            Últimos 30 dias
          </button>
        </div>

        {/* inputs */}
        <div className="flex-1 p-5 space-y-4 bg-white">
          <div className="text-sm font-medium text-slate-900">Período</div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={localStart}
              onChange={(e) => {
                setLocalStart(e.target.value);
                setPresetAtivo(null);
              }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />

            <input
              type="date"
              value={localEnd}
              onChange={(e) => {
                setLocalEnd(e.target.value);
                setPresetAtivo(null);
              }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 mt-2"
              onClick={applyFilter}
            >
              Aplicar
            </Button>

            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 mt-2"
              onClick={resetFilter}
            >
              Limpar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
