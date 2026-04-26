export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  custo: number;
  estoque: number;
  estoque_minimo: number;
  created_at: string;
}

export type StatusOS = 'em_analise' | 'em_andamento' | 'pronto' | 'entregue';

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  em_analise: 'Em análise',
  em_andamento: 'Em andamento',
  pronto: 'Pronto',
  entregue: 'Entregue',
};

export const STATUS_OS_COLORS: Record<StatusOS, string> = {
  em_analise: 'bg-slate-500',
  em_andamento: 'bg-amber-500',
  pronto: 'bg-emerald-500',
  entregue: 'bg-blue-500',
};

export interface OrdemServico {
  id: string;
  cliente_id: string;
  cliente?: Cliente;
  aparelho: string;
  defeito: string;
  observacoes: string;
  status: StatusOS;
  valor: number;
  pecas_usadas: string;
  data_entrada: string;
  data_saida: string | null;
  created_at: string;
}

export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito';

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_debito: 'Cartão Débito',
  cartao_credito: 'Cartão Crédito',
};

export interface Venda {
  id: string;
  cliente_id: string | null;
  cliente?: Cliente | null;
  total: number;
  forma_pagamento: FormaPagamento;
  parcelas: number;
  troco: number;
  recebido: number;
  created_at: string;
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_id: string;
  produto?: Produto;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

export interface CarrinhoItem {
  produto: Produto;
  quantidade: number;
}
