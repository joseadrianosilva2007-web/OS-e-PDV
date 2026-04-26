import { useNavigate } from 'react-router-dom';
import { Wrench, ShoppingCart, Package, Users, ClipboardList, BarChart3 } from 'lucide-react';
import Header from '../components/Header';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <Header title="Início" />
      <div className="flex-1 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/nova-os')} className="btn-primary flex flex-col items-center gap-2 py-6">
            <Wrench size={28} />
            <span className="text-sm">Nova OS</span>
          </button>
          <button onClick={() => navigate('/pdv')} className="btn-success flex flex-col items-center gap-2 py-6">
            <ShoppingCart size={28} />
            <span className="text-sm">Nova Venda</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/lista-os')} className="btn-secondary flex flex-col items-center gap-2 py-5">
            <ClipboardList size={24} />
            <span className="text-sm">Buscar OS</span>
          </button>
          <button onClick={() => navigate('/produtos')} className="btn-secondary flex flex-col items-center gap-2 py-5">
            <Package size={24} />
            <span className="text-sm">Produtos</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/clientes')} className="btn-secondary flex flex-col items-center gap-2 py-5">
            <Users size={24} />
            <span className="text-sm">Clientes</span>
          </button>
          <button onClick={() => navigate('/relatorios')} className="btn-secondary flex flex-col items-center gap-2 py-5">
            <BarChart3 size={24} />
            <span className="text-sm">Relatórios</span>
          </button>
        </div>

        <div className="card mt-4">
          <h3 className="font-semibold text-sm mb-2 text-slate-500 dark:text-slate-400">Dicas</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">• Use o menu para acessar todas as funções</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">• Cadastre produtos antes de vender</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">• Clientes são salvos automaticamente</p>
        </div>
      </div>
    </div>
  );
}
