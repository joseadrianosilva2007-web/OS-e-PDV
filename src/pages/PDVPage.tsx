import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, CheckCircle, CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';
import { localDB } from '../lib/db';
import { Produto, CarrinhoItem, FormaPagamento, FORMA_PAGAMENTO_LABELS, Venda, VendaItem, Cliente } from '../types';
import Header from '../components/Header';

export default function PDVPage() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [busca, setBusca] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro');
  const [recebido, setRecebido] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTel, setClienteTel] = useState('');
  const [etapa, setEtapa] = useState<'produtos' | 'pagamento'>('produtos');
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    setProdutos(localDB.produtos.getAll());
  }, []);

  const produtosFiltrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [produtos, busca]);

  const total = useMemo(() => carrinho.reduce((s, item) => s + item.produto.preco * item.quantidade, 0), [carrinho]);

  const addProduto = (produto: Produto) => {
    if (produto.estoque <= 0) return;
    setCarrinho(prev => {
      const idx = prev.findIndex(i => i.produto.id === produto.id);
      if (idx >= 0) {
        if (prev[idx].quantidade >= produto.estoque) return prev;
        const novo = [...prev];
        novo[idx] = { ...novo[idx], quantidade: novo[idx].quantidade + 1 };
        return novo;
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removeProduto = (produtoId: string) => {
    setCarrinho(prev => {
      const idx = prev.findIndex(i => i.produto.id === produtoId);
      if (idx < 0) return prev;
      const novo = [...prev];
      if (novo[idx].quantidade > 1) {
        novo[idx] = { ...novo[idx], quantidade: novo[idx].quantidade - 1 };
      } else {
        novo.splice(idx, 1);
      }
      return novo;
    });
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setBusca('');
    setEtapa('produtos');
  };

  const formatTel = (v: string) => {
    const nums = v.replace(/\D/g, '');
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) return;

    const cleanTel = clienteTel.replace(/\D/g, '');
    let cliente: Cliente | null = null;
    if (cleanTel.length >= 10) {
      cliente = localDB.clientes.getByTelefone(cleanTel) || null;
      if (!cliente && clienteNome.trim()) {
        cliente = {
          id: crypto.randomUUID(),
          nome: clienteNome.trim(),
          telefone: cleanTel,
          created_at: new Date().toISOString(),
        };
        localDB.clientes.save(cliente);
      }
    }

    const venda: Venda = {
      id: crypto.randomUUID(),
      cliente_id: cliente?.id || null,
      total,
      forma_pagamento: formaPagamento,
      parcelas: formaPagamento === 'cartao_credito' ? parcelas : 1,
      troco: formaPagamento === 'dinheiro' ? Math.max(0, parseFloat(recebido) - total) : 0,
      recebido: formaPagamento === 'dinheiro' ? parseFloat(recebido) : total,
      created_at: new Date().toISOString(),
    };

    localDB.vendas.save(venda);

    carrinho.forEach(item => {
      localDB.vendas.saveItem({
        id: crypto.randomUUID(),
        venda_id: venda.id,
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco,
        total: item.produto.preco * item.quantidade,
      });
      localDB.produtos.updateEstoque(item.produto.id, -item.quantidade);
    });

    setProdutos(localDB.produtos.getAll());
    setFinalizado(true);
  };

  const troco = formaPagamento === 'dinheiro' ? Math.max(0, parseFloat(recebido) - total) : 0;

  if (finalizado) {
    return (
      <div className="page-container">
        <Header title="Venda Concluída" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <CheckCircle size={64} className="text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Venda Finalizada!</h2>
          <p className="text-lg font-semibold text-emerald-600 mb-1">Total: R$ {total.toFixed(2)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {FORMA_PAGAMENTO_LABELS[formaPagamento]}
            {formaPagamento === 'dinheiro' && troco > 0 && ` - Troco: R$ ${troco.toFixed(2)}`}
          </p>
          <button onClick={() => { setFinalizado(false); limparCarrinho(); }} className="btn-primary max-w-xs">
            Nova Venda
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary max-w-xs mt-3">
            Ir para Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header title={etapa === 'produtos' ? 'Nova Venda' : 'Pagamento'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {etapa === 'produtos' ? (
          <>
            <div className="p-4 pb-2 space-y-3">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ArrowLeft size={18} /> Voltar
              </button>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="input-field"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-2">
                {produtosFiltrados.map(produto => (
                  <div
                    key={produto.id}
                    onClick={() => addProduto(produto)}
                    className={`card flex justify-between items-center cursor-pointer ${produto.estoque <= 0 ? 'opacity-50' : 'active:scale-[0.98] transition-transform'}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{produto.nome}</p>
                      <p className="text-xs text-slate-500">Estoque: {produto.estoque}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">R$ {produto.preco.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {carrinho.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg">
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {carrinho.map(item => (
                    <div key={item.produto.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeProduto(item.produto.id)} className="p-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600">
                          <Minus size={14} />
                        </button>
                        <span>{item.quantidade}x</span>
                        <button onClick={() => addProduto(item.produto)} className="p-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                          <Plus size={14} />
                        </button>
                        <span className="truncate max-w-[120px]">{item.produto.nome}</span>
                      </div>
                      <span className="font-medium">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold">Total:</span>
                  <span className="text-xl font-bold text-emerald-600">R$ {total.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={limparCarrinho} className="btn-secondary py-3 text-sm flex items-center justify-center gap-1">
                    <Trash2 size={16} /> Limpar
                  </button>
                  <button onClick={() => setEtapa('pagamento')} className="btn-success py-3 text-sm flex items-center justify-center gap-1">
                    <ShoppingCart size={16} /> Pagar
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="card space-y-3">
              <h3 className="font-semibold text-sm text-slate-500 uppercase">Resumo</h3>
              {carrinho.map(item => (
                <div key={item.produto.id} className="flex justify-between text-sm">
                  <span>{item.quantidade}x {item.produto.nome}</span>
                  <span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold text-xl text-emerald-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="card space-y-3">
              <h3 className="font-semibold text-sm text-slate-500 uppercase">Cliente (opcional)</h3>
              <input type="text" placeholder="Nome" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="input-field" />
              <input type="tel" placeholder="Telefone" value={clienteTel} onChange={e => setClienteTel(formatTel(e.target.value))} className="input-field" />
            </div>

            <div className="card space-y-3">
              <h3 className="font-semibold text-sm text-slate-500 uppercase">Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'dinheiro' as FormaPagamento, icon: Banknote, label: 'Dinheiro' },
                  { key: 'pix' as FormaPagamento, icon: Smartphone, label: 'Pix' },
                  { key: 'cartao_debito' as FormaPagamento, icon: CreditCard, label: 'Débito' },
                  { key: 'cartao_credito' as FormaPagamento, icon: CreditCard, label: 'Crédito' },
                ]).map(fp => (
                  <button
                    key={fp.key}
                    onClick={() => setFormaPagamento(fp.key)}
                    className={`py-3 px-2 rounded-lg flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                      formaPagamento === fp.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <fp.icon size={18} />
                    {fp.label}
                  </button>
                ))}
              </div>

              {formaPagamento === 'dinheiro' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor recebido (R$)"
                    value={recebido}
                    onChange={e => setRecebido(e.target.value)}
                    className="input-field"
                    autoFocus
                  />
                  {troco > 0 && (
                    <p className="text-lg font-bold text-emerald-600 text-center">Troco: R$ {troco.toFixed(2)}</p>
                  )}
                </div>
              )}

              {formaPagamento === 'cartao_credito' && (
                <div>
                  <label className="text-xs text-slate-500">Parcelas</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                      <button
                        key={n}
                        onClick={() => setParcelas(n)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                          parcelas === n ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        {n}x R$ {(total / n).toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setEtapa('produtos')} className="btn-secondary py-3 text-sm">
                Voltar
              </button>
              <button onClick={finalizarVenda} className="btn-success py-3 text-sm flex items-center justify-center gap-2">
                <Receipt size={16} /> Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
