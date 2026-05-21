import { ReactNode } from 'react';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompany } from '@/hooks/useDashboardData';
import logo from '../assets/logoEasyPharma.png';
import { useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const handleLogout = () => {
    window.location.href = '/';
  };

  const { data: company } = useCompany();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-22 flex items-center justify-center border-b border-slate-800">
          <img src={logo} className="h-full object-contain brightness-0 invert scale-125" />
        </div>

        <nav className="flex-1 p-4 space-y-2">

          {/* Dashboard */}
          
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 p-2 rounded ${
              location.pathname === '/dashboard'
                ? 'bg-blue-600'
                : 'hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          {/* Estoque */}
          <Link 
            to="/inventory"             
            className={`flex items-center gap-3 p-2 rounded ${
            location.pathname === '/inventory'
              ? 'bg-blue-600'
              : 'hover:bg-slate-800'
             }`}
            >
            <Package size={20} /> Estoque
          </Link>

          {/* Vendas */}
          <Link 
            to="/sales" 
            className={`flex items-center gap-3 p-2 rounded ${
            location.pathname === '/sales'
              ? 'bg-blue-600'
              : 'hover:bg-slate-800'
             }`}
          >
            <ShoppingCart size={20} /> Vendas
          </Link>

        </nav>

        <button 
          onClick={handleLogout} 
          className="p-4 flex items-center gap-3 hover:bg-red-900 transition border-t border-slate-800"
        >
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Visão Geral</h2>
          <div className="text-sm text-slate-500">
            Unidade: {company?.empresa || 'Carregando...'}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}