import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Wrench, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { localDB } from '../lib/db';
import { VendaItem } from '../types';
import Header from '../components/Header';

export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  const vendas = localDB.vendas.getAll();
  const produtos = localDB.produtos.getAll();
  const oss = localDB.os.getAll();
  const vendasItens = useMemo(() => {
    const all: VendaItem[] = [];
    vendas.forEach(v => {
      all.push(...localDB.vendas.getItens(v.id));
    });
    return all;
  }, [vendas]);

  const filtrarData = (data: string) => {
    const d = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (periodo === 'hoje') {
      return d.toDateString() === hoje.toDateString();
    }
    if (periodo === 'semana') {
      const semanaAtras = new Date(hoje);
      semanaAtras.setDate(semanaAtras.getDate() - 7);
      return d >= semanaAtras;
    }
    if (periodo === 'mes') {
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    }
    return true;
  };

  const vendasFiltradas = vendas.filter(v => filtrarData(v.created_at));
  const osFiltradas = oss.filter(o => filtrarData(o.data_entrada));

  const totalVendas = vendasFiltradas.reduce((s, v) => s + v.total, 0);
  const totalOS = osFiltradas.filter(o => o.status === 'entregue').reduce((s, o) => s + o.valor, 0);

  const lucroVendas = vendasFiltradas.reduce((s, v) => {
    const itens = localDB.vendas.getItens(v.id);
    const custoItens = itens.reduce((c, item) => {
      const prod = produtos.find(p => p.id === item.produto_id);
      return c + (prod?.custo || 0) * item.quantidade;
    }, 0);
    return s + (v.total - custoItens);
  }, 0);

  const produtosMaisVendidos = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; total: number }>();
    vendasFiltradas.forEach(v => {
      localDB.vendas.getItens(v.id).forEach(item => {
        const p = produtos.find(pr => pr.id === item.produto_id);
        if (p) {
          const ex = map.get(p.id) || { nome: p.nome, qtd: 0, total: 0 };
          ex.qtd += item.quantidade;
          ex.total += item.total;
          map.set(p.id, ex);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  }, [vendasFiltradas, produtos]);

  const osPorStatus = {
    em_analise: osFiltradas.filter(o => o.status === 'em_analise').length,
    em_andamento: osFiltradas.filter(o => o.status === 'em_andamento').length,
    pronto: osFiltradas.filter(o => o.status === 'pronto').length,
    entregue: osFiltradas.filter(o => o.status === 'entregue').length,
  };

  return (
    <div className="page-container">
      <Header title="Relatórios" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="flex gap-2">
          {(['hoje', 'semana', 'mes'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                periodo === p ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? '7 dias' : 'Mês'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <DollarSign size={20} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">R$ {totalVendas.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Vendas</p>
          </div>
          <div className="card text-center">
            <TrendingUp size={20} className="mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-blue-600">R$ {totalOS.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Serviços</p>
          </div>
          <div className="card text-center">
            <TrendingUp size={20} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">R$ {(totalVendas + totalOS).toFixed(2)}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="card text-center">
            <TrendingDown size={20} className="mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-amber-600">R$ {lucroVendas.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Lucro Est.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-sm text-slate-500 mb-3 flex items-center gap-2">
            <Wrench size={16} /> Ordens de Serviço
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="font-bold text-lg">{osPorStatus.em_analise}</p>
              <p className="text-slate-500">Em análise</p>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="font-bold text-lg text-amber-600">{osPorStatus.em_andamento}</p>
              <p className="text-slate-500">Em andamento</p>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="font-bold text-lg text-emerald-600">{osPorStatus.pronto}</p>
              <p className="text-slate-500">Prontos</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-bold text-lg text-blue-600">{osPorStatus.entregue}</p>
              <p className="text-slate-500">Entregues</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-sm text-slate-500 mb-3 flex items-center gap-2">
            <ShoppingCart size={16} /> Produtos Mais Vendidos
          </h3>
          {produtosMaisVendidos.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhuma venda no período</p>
          ) : (
            <div className="space-y-2">
              {produtosMaisVendidos.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="truncate flex-1">{i + 1}. {p.nome}</span>
                  <div className="text-right">
                    <span className="font-medium">{p.qtd}x</span>
                    <span className="text-xs text-slate-400 ml-2">R$ {p.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-sm text-slate-500 mb-3 flex items-center gap-2">
            <Package size={16} /> Estoque Baixo
          </h3>
          {produtos.filter(p => p.estoque <= p.estoque_minimo).length === 0 ? (
            <p className="text-sm text-emerald-500 text-center py-2">Estoque ok</p>
          ) : (
            <div className="space-y-2">
              {produtos.filter(p => p.estoque <= p.estoque_minimo).map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.nome}</span>
                  <span className="text-red-500 font-medium">{p.estoque} un</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
