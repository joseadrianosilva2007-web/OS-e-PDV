import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Phone } from 'lucide-react';
import { localDB } from '../lib/db';
import { OrdemServico, StatusOS, Cliente } from '../types';
import Header from '../components/Header';

export default function NovaOSPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [aparelho, setAparelho] = useState('');
  const [defeito, setDefeito] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [valor, setValor] = useState('');
  const [pecas, setPecas] = useState('');
  const [erro, setErro] = useState('');
  const [saving, setSaving] = useState(false);
  const telefoneRef = useRef<HTMLInputElement>(null);

  const formatTelefone = (v: string) => {
    const nums = v.replace(/\D/g, '');
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const buscarCliente = () => {
    const clean = telefone.replace(/\D/g, '');
    const cliente = localDB.clientes.getByTelefone(clean);
    if (cliente) {
      setNome(cliente.nome);
    }
  };

  const abrirWhatsApp = () => {
    const clean = telefone.replace(/\D/g, '');
    if (clean.length >= 10) {
      window.open(`https://wa.me/55${clean}`, '_blank');
    }
  };

  const salvar = async () => {
    if (!nome.trim() || !aparelho.trim()) {
      setErro('Preencha nome do cliente e aparelho');
      return;
    }
    setSaving(true);

    const cleanTel = telefone.replace(/\D/g, '');
    let cliente = localDB.clientes.getByTelefone(cleanTel);
    if (!cliente) {
      cliente = {
        id: crypto.randomUUID(),
        nome: nome.trim(),
        telefone: cleanTel,
        created_at: new Date().toISOString(),
      };
      localDB.clientes.save(cliente);
    }

    const os: OrdemServico = {
      id: crypto.randomUUID(),
      cliente_id: cliente.id,
      aparelho: aparelho.trim(),
      defeito: defeito.trim(),
      observacoes: observacoes.trim(),
      status: 'em_analise',
      valor: parseFloat(valor) || 0,
      pecas_usadas: pecas.trim(),
      data_entrada: new Date().toISOString(),
      data_saida: null,
      created_at: new Date().toISOString(),
    };
    localDB.os.save(os);

    setSaving(false);
    navigate('/lista-os');
  };

  return (
    <div className="page-container">
      <Header title="Nova Ordem de Serviço" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <ArrowLeft size={18} /> Voltar
        </button>

        {erro && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{erro}</div>}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Telefone</label>
            <div className="flex gap-2">
              <input
                ref={telefoneRef}
                type="tel"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={e => setTelefone(formatTelefone(e.target.value))}
                onBlur={buscarCliente}
                className="input-field flex-1"
              />
              <button onClick={abrirWhatsApp} className="btn-secondary px-3" disabled={telefone.replace(/\D/g, '').length < 10}>
                <Phone size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nome do Cliente</label>
            <input type="text" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Aparelho / Modelo</label>
            <input type="text" placeholder="Ex: iPhone 14 Pro Max" value={aparelho} onChange={e => setAparelho(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Defeito Relatado</label>
            <textarea placeholder="Ex: Tela quebrada, não liga..." value={defeito} onChange={e => setDefeito(e.target.value)} className="input-field min-h-[80px]" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Observações</label>
            <textarea placeholder="Condições gerais do aparelho..." value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input-field min-h-[60px]" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Valor do Serviço (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Peças Usadas</label>
            <input type="text" placeholder="Ex: Display iPhone 14, bateria..." value={pecas} onChange={e => setPecas(e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button onClick={salvar} disabled={saving} className="btn-primary flex items-center justify-center gap-2">
            <Save size={20} /> {saving ? 'Salvando...' : 'Salvar OS'}
          </button>
        </div>
      </div>
    </div>
  );
}
