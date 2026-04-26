import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Wrench, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const menuItems = [
  { label: 'Início', icon: BarChart3, path: '/' },
  { label: 'Nova OS', icon: Wrench, path: '/nova-os' },
  { label: 'Nova Venda', icon: ShoppingCart, path: '/pdv' },
  { label: 'Ordens de Serviço', icon: Wrench, path: '/lista-os' },
  { label: 'Produtos', icon: Package, path: '/produtos' },
  { label: 'Clientes', icon: Users, path: '/clientes' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export default function Header({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { dark, toggle } = useTheme();

  const go = (path: string) => { navigate(path); setOpen(false); };

  return (
    <>
      <header className="bg-blue-600 dark:bg-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-slate-700">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold">{title || 'OS+PDV'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-slate-700">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="w-64 bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-blue-600 dark:bg-slate-900 text-white flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">OS+PDV</p>
                <p className="text-xs opacity-80">{user?.nome}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-blue-700 rounded">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {menuItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => { logout(); go('/login'); }} className="w-full flex items-center gap-3 text-red-500 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={20} />
                <span className="text-sm font-semibold">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
