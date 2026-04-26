import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Filter, Wrench } from 'lucide-react';
import { localDB } from '../lib/db';
import { OrdemServico, STATUS_OS_LABELS, STATUS_OS_COLORS } from '../types';
import Header from '../components/Header';

export default function ListaOSPage() {
  const navigate = useNavigate();
  const [oss, setOss] = useState<OrdemServico[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  useEffect(() => {
    const all = localDB.os.getAll();
    setOss(all);
  }, []);

  const filtered = oss.filter(os => {
    const matchFiltro =
      (os.cliente?.nome || '').toLowerCase().includes(filtro.toLowerCase()) ||
      os.aparelho.toLowerCase().includes(filtro.toLowerCase()) ||
      os.id.slice(0, 8).toLowerCase().includes(filtro.toLowerCase());
    const matchStatus = statusFiltro === 'todos' || os.status === statusFiltro;
    return matchFiltro && matchStatus;
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="page-container">
      <Header title="Ordens de Serviço" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente ou aparelho..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['todos', 'em_analise', 'em_andamento', 'pronto', 'entregue'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFiltro(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFiltro === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {s === 'todos' ? 'Todos' : STATUS_OS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Wrench size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma OS encontrada</p>
            </div>
          )}
          {filtered.map(os => (
            <div key={os.id} onClick={() => navigate(`/os/${os.id}`)} className="card cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{os.cliente?.nome || 'Cliente'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{os.aparelho}</p>
                </div>
                <span className={`${STATUS_OS_COLORS[os.status]} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                  {STATUS_OS_LABELS[os.status]}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>OS #{os.id.slice(0, 8).toUpperCase()}</span>
                <span>{formatDate(os.data_entrada)}</span>
              </div>
              {os.valor > 0 && (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  R$ {os.valor.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
