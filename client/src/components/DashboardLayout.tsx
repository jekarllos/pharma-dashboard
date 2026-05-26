import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCompany } from "@/hooks/useDashboardData";
import logo from "../assets/logoEasyPharma.png";
import logoPilula from "../assets/logoPilulaEasyPharma.png";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Estado: true = sidebar aberta, false = sidebar fechada
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const { data: company } = useCompany();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - largura muda conforme estado */}
      <aside
        className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${
          sidebarAberta ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-22 flex items-center justify-center border-b border-slate-800">
          <img
            src={sidebarAberta ? logo : logoPilula}
            className={`object-contain brightness-0 invert scale-125 transition-all duration-300 ${
              sidebarAberta ? "h-full" : "h-8"
            }`}
          />
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 p-2 rounded transition-all ${
              location.pathname === "/dashboard"
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            } ${!sidebarAberta && "justify-center"}`}
            title={!sidebarAberta ? "Dashboard" : ""}
          >
            <LayoutDashboard size={20} />
            {sidebarAberta && <span>Dashboard</span>}
          </Link>

          {/* Estoque */}
          <Link
            to="/inventory"
            className={`flex items-center gap-3 p-2 rounded transition-all ${
              location.pathname === "/inventory"
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            } ${!sidebarAberta && "justify-center"}`}
            title={!sidebarAberta ? "Estoque" : ""}
          >
            <Package size={20} />
            {sidebarAberta && <span>Estoque</span>}
          </Link>

          {/* Vendas */}
          <Link
            to="/sales"
            className={`flex items-center gap-3 p-2 rounded transition-all ${
              location.pathname === "/sales"
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            } ${!sidebarAberta && "justify-center"}`}
            title={!sidebarAberta ? "Vendas" : ""}
          >
            <ShoppingCart size={20} />
            {sidebarAberta && <span>Vendas</span>}
          </Link>
        </nav>

        {/* Botão Sair */}
        <button
          onClick={handleLogout}
          className={`p-4 flex items-center gap-3 hover:bg-red-900 transition border-t border-slate-800 ${
            !sidebarAberta && "justify-center"
          }`}
          title={!sidebarAberta ? "Sair" : ""}
        >
          <LogOut size={20} />
          {sidebarAberta && <span>Sair</span>}
        </button>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER COM O BOTÃO */}
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <div className="flex items-center gap-4">
            {/* BOTÃO PARA ABRIR/FECHAR SIDEBAR */}
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Menu size={20} className="text-slate-600" />
            </button>

            <h2 className="text-lg font-semibold text-slate-700">
              Visão Geral
            </h2>
          </div>
          <div className="text-sm text-slate-500">
            Unidade: {company?.empresa || "Carregando..."}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
