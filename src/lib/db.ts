import { Cliente, Produto, OrdemServico, Venda, VendaItem } from '../types';

const DB_KEYS = {
  clientes: 'ospdv_clientes',
  produtos: 'ospdv_produtos',
  os: 'ospdv_os',
  vendas: 'ospdv_vendas',
  vendas_itens: 'ospdv_vendas_itens',
  config: 'ospdv_config',
  usuarios: 'ospdv_usuarios',
};

function getItem<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localDB = {
  clientes: {
    getAll: (): Cliente[] => getItem(DB_KEYS.clientes),
    getById: (id: string): Cliente | undefined => getItem<Cliente>(DB_KEYS.clientes).find(c => c.id === id),
    getByTelefone: (telefone: string): Cliente | undefined => getItem<Cliente>(DB_KEYS.clientes).find(c => c.telefone === telefone),
    save: (cliente: Cliente) => {
      const all = getItem<Cliente>(DB_KEYS.clientes);
      const idx = all.findIndex(c => c.id === cliente.id);
      if (idx >= 0) all[idx] = cliente; else all.push(cliente);
      setItem(DB_KEYS.clientes, all);
    },
    delete: (id: string) => setItem(DB_KEYS.clientes, getItem<Cliente>(DB_KEYS.clientes).filter(c => c.id !== id)),
  },
  produtos: {
    getAll: (): Produto[] => getItem(DB_KEYS.produtos),
    getById: (id: string): Produto | undefined => getItem<Produto>(DB_KEYS.produtos).find(p => p.id === id),
    save: (produto: Produto) => {
      const all = getItem<Produto>(DB_KEYS.produtos);
      const idx = all.findIndex(p => p.id === produto.id);
      if (idx >= 0) all[idx] = produto; else all.push(produto);
      setItem(DB_KEYS.produtos, all);
    },
    delete: (id: string) => setItem(DB_KEYS.produtos, getItem<Produto>(DB_KEYS.produtos).filter(p => p.id !== id)),
    updateEstoque: (id: string, quantidade: number) => {
      const p = localDB.produtos.getById(id);
      if (p) { p.estoque += quantidade; localDB.produtos.save(p); }
    },
  },
  os: {
    getAll: (): OrdemServico[] => getItem(DB_KEYS.os).sort((a: OrdemServico, b: OrdemServico) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    getById: (id: string): OrdemServico | undefined => getItem<OrdemServico>(DB_KEYS.os).find(o => o.id === id),
    getByCliente: (clienteId: string): OrdemServico[] => getItem<OrdemServico>(DB_KEYS.os).filter(o => o.cliente_id === clienteId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    save: (os: OrdemServico) => {
      const all = getItem<OrdemServico>(DB_KEYS.os);
      const idx = all.findIndex(o => o.id === os.id);
      if (idx >= 0) all[idx] = os; else all.push(os);
      setItem(DB_KEYS.os, all);
    },
    delete: (id: string) => setItem(DB_KEYS.os, getItem<OrdemServico>(DB_KEYS.os).filter(o => o.id !== id)),
  },
  vendas: {
    getAll: (): Venda[] => getItem(DB_KEYS.vendas).sort((a: Venda, b: Venda) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    getById: (id: string): Venda | undefined => getItem<Venda>(DB_KEYS.vendas).find(v => v.id === id),
    getByCliente: (clienteId: string): Venda[] => getItem<Venda>(DB_KEYS.vendas).filter(v => v.cliente_id === clienteId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    save: (venda: Venda) => {
      const all = getItem<Venda>(DB_KEYS.vendas);
      const idx = all.findIndex(v => v.id === venda.id);
      if (idx >= 0) all[idx] = venda; else all.push(venda);
      setItem(DB_KEYS.vendas, all);
    },
    getItens: (vendaId: string): VendaItem[] => getItem<VendaItem>(DB_KEYS.vendas_itens).filter(i => i.venda_id === vendaId),
    saveItem: (item: VendaItem) => {
      const all = getItem<VendaItem>(DB_KEYS.vendas_itens);
      const idx = all.findIndex(i => i.id === item.id);
      if (idx >= 0) all[idx] = item; else all.push(item);
      setItem(DB_KEYS.vendas_itens, all);
    },
  },
  config: {
    get: (key: string): any => {
      try { return JSON.parse(localStorage.getItem(DB_KEYS.config) || '{}')[key]; }
      catch { return null; }
    },
    set: (key: string, value: any) => {
      const cfg = JSON.parse(localStorage.getItem(DB_KEYS.config) || '{}');
      cfg[key] = value;
      localStorage.setItem(DB_KEYS.config, JSON.stringify(cfg));
    },
  },
  usuarios: {
    getAll: () => getItem(DB_KEYS.usuarios),
    save: (u: any) => {
      const all = getItem(DB_KEYS.usuarios);
      const idx = all.findIndex((x: any) => x.id === u.id);
      if (idx >= 0) all[idx] = u; else all.push(u);
      setItem(DB_KEYS.usuarios, all);
    },
  },
  exportAll: () => {
    const data = {
      clientes: getItem(DB_KEYS.clientes),
      produtos: getItem(DB_KEYS.produtos),
      os: getItem(DB_KEYS.os),
      vendas: getItem(DB_KEYS.vendas),
      vendas_itens: getItem(DB_KEYS.vendas_itens),
      config: getItem(DB_KEYS.config),
      usuarios: getItem(DB_KEYS.usuarios),
    };
    return JSON.stringify(data, null, 2);
  },
  importAll: (json: string) => {
    const data = JSON.parse(json);
    if (data.clientes) setItem(DB_KEYS.clientes, data.clientes);
    if (data.produtos) setItem(DB_KEYS.produtos, data.produtos);
    if (data.os) setItem(DB_KEYS.os, data.os);
    if (data.vendas) setItem(DB_KEYS.vendas, data.vendas);
    if (data.vendas_itens) setItem(DB_KEYS.vendas_itens, data.vendas_itens);
    if (data.config) setItem(DB_KEYS.config, data.config);
    if (data.usuarios) setItem(DB_KEYS.usuarios, data.usuarios);
  },
  clearAll: () => {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  },
};

// seed initial admin user if none exists
if (localDB.usuarios.getAll().length === 0) {
  localDB.usuarios.save({ id: '1', nome: 'Admin', usuario: 'admin', senha: '123456' });
}
