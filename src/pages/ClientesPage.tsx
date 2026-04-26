import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Phone, MessageCircle, Wrench, ShoppingCart, ChevronRight } from 'lucide-react';
import { localDB } from '../lib/db';
import { Cliente } from '../types';
import Header from '../components/Header';

export default function ClientesPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => { setClientes(localDB.clientes.getAll()); }, []);

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca.replace(/\D/g, ''))
  );

  const formatTel = (tel: string) => {
    if (tel.length === 11) return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    if (tel.length === 10) return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
    return tel;
  };

  return (
    <div className="page-container">
      <Header title="Clientes" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar cliente..." value={busca} onChange={e => setBusca(e.target.value)} className="input-field pl-10" />
        </div>

        <div className="space-y-2">
          {filtrados.map(c => {
            const oss = localDB.os.getByCliente(c.id);
            const vendas = localDB.vendas.getByCliente(c.id);
            const isOpen = expandido === c.id;

            return (
              <div key={c.id} className="card">
                <div onClick={() => setExpandido(isOpen ? null : c.id)} className="flex justify-between items-center cursor-pointer">
                  <div>
                    <p className="font-semibold text-sm">{c.nome}</p>
                    <p className="text-xs text-slate-500">{formatTel(c.telefone)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {oss.length > 0 && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-full">{oss.length} OS</span>}
                    {vendas.length > 0 && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-1 rounded-full">{vendas.length} vendas</span>}
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex gap-2">
                      <a href={`tel:+55${c.telefone}`} className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-1">
                        <Phone size={14} /> Ligar
                      </a>
                      <a href={`https://wa.me/55${c.telefone}`} target="_blank" rel="noopener noreferrer" className="flex-1 btn-success py-2 text-xs flex items-center justify-center gap-1">
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>

                    {oss.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Wrench size={12} /> Ordens de Serviço</p>
                        <div className="space-y-1">
                          {oss.slice(0, 5).map(o => (
                            <div key={o.id} onClick={() => navigate(`/os/${o.id}`)} className="text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between cursor-pointer">
                              <span>{o.aparelho} - {o.status}</span>
                              <span className="text-slate-400">{new Date(o.data_entrada).toLocaleDateString('pt-BR')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {vendas.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><ShoppingCart size={12} /> Compras</p>
                        <div className="space-y-1">
                          {vendas.slice(0, 5).map(v => (
                            <div key={v.id} className="text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between">
                              <span>{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                              <span className="font-medium">R$ {v.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
