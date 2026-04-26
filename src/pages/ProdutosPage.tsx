import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Search, Package, AlertTriangle } from 'lucide-react';
import { localDB } from '../lib/db';
import { Produto } from '../types';
import Header from '../components/Header';

export default function ProdutosPage() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [custo, setCusto] = useState('');
  const [estoque, setEstoque] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');

  useEffect(() => { setProdutos(localDB.produtos.getAll()); }, []);

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirModal = (p?: Produto) => {
    if (p) {
      setEditando(p);
      setNome(p.nome);
      setPreco(String(p.preco));
      setCusto(String(p.custo));
      setEstoque(String(p.estoque));
      setEstoqueMinimo(String(p.estoque_minimo));
    } else {
      setEditando(null);
      setNome('');
      setPreco('');
      setCusto('');
      setEstoque('');
      setEstoqueMinimo('5');
    }
    setModal(true);
  };

  const salvar = () => {
    if (!nome.trim()) return;
    const produto: Produto = {
      id: editando?.id || crypto.randomUUID(),
      nome: nome.trim(),
      preco: parseFloat(preco) || 0,
      custo: parseFloat(custo) || 0,
      estoque: parseInt(estoque) || 0,
      estoque_minimo: parseInt(estoqueMinimo) || 5,
      created_at: editando?.created_at || new Date().toISOString(),
    };
    localDB.produtos.save(produto);
    setProdutos(localDB.produtos.getAll());
    setModal(false);
  };

  const excluir = (id: string) => {
    if (!confirm('Excluir produto?')) return;
    localDB.produtos.delete(id);
    setProdutos(localDB.produtos.getAll());
  };

  const ajustarEstoque = (id: string, qtd: number) => {
    localDB.produtos.updateEstoque(id, qtd);
    setProdutos(localDB.produtos.getAll());
  };

  return (
    <div className="page-container">
      <Header title="Produtos" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="input-field pl-10" />
          </div>
          <button onClick={() => abrirModal()} className="btn-primary px-4 py-3 flex items-center gap-1">
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {filtrados.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Package size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum produto cadastrado</p>
            </div>
          )}
          {filtrados.map(p => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{p.nome}</p>
                    {p.estoque <= p.estoque_minimo && (
                      <AlertTriangle size={14} className="text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Estoque: <span className={p.estoque <= p.estoque_minimo ? 'text-red-500 font-bold' : ''}>{p.estoque}</span>
                    {' '}| Min: {p.estoque_minimo}
                  </p>
                  <p className="text-xs text-slate-400">Custo: R$ {p.custo.toFixed(2)} | Venda: <span className="text-emerald-600 font-medium">R$ {p.preco.toFixed(2)}</span></p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => ajustarEstoque(p.id, 1)} className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => ajustarEstoque(p.id, -1)} className="p-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                    <Minus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => abrirModal(p)} className="flex-1 py-2 text-xs bg-slate-100 dark:bg-slate-700 rounded-lg font-medium">Editar</button>
                <button onClick={() => excluir(p.id)} className="flex-1 py-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg font-medium">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <h3 className="font-bold text-lg">{editando ? 'Editar' : 'Novo'} Produto</h3>
            <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input-field" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.01" placeholder="Preço (R$)" value={preco} onChange={e => setPreco(e.target.value)} className="input-field" />
              <input type="number" step="0.01" placeholder="Custo (R$)" value={custo} onChange={e => setCusto(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Estoque" value={estoque} onChange={e => setEstoque(e.target.value)} className="input-field" />
              <input type="number" placeholder="Mínimo" value={estoqueMinimo} onChange={e => setEstoqueMinimo(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setModal(false)} className="btn-secondary py-3 text-sm">Cancelar</button>
              <button onClick={salvar} className="btn-success py-3 text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
