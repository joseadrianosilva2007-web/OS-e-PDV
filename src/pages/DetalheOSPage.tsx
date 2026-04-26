import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, CheckCircle, Wrench, Truck, Ban, Printer } from 'lucide-react';
import { localDB } from '../lib/db';
import { OrdemServico, STATUS_OS_LABELS, STATUS_OS_COLORS, StatusOS } from '../types';
import Header from '../components/Header';

const STATUS_FLOW: StatusOS[] = ['em_analise', 'em_andamento', 'pronto', 'entregue'];

export default function DetalheOSPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState<OrdemServico | null>(null);

  useEffect(() => {
    if (id) {
      const found = localDB.os.getById(id);
      if (found) {
        const cliente = localDB.clientes.getById(found.cliente_id);
        setOs({ ...found, cliente });
      }
    }
  }, [id]);

  const mudarStatus = (novoStatus: StatusOS) => {
    if (!os) return;
    const updated = { ...os, status: novoStatus, data_saida: novoStatus === 'entregue' ? new Date().toISOString() : os.data_saida };
    localDB.os.save(updated);
    setOs(updated);
  };

  const enviarWhatsApp = (mensagem: string) => {
    if (!os?.cliente?.telefone) return;
    const tel = os.cliente.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(mensagem);
    window.open(`https://wa.me/55${tel}?text=${msg}`, '_blank');
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR') + ' ' + new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!os) {
    return (
      <div className="page-container">
        <Header title="Detalhes da OS" />
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p>OS não encontrada</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(os.status);

  return (
    <div className="page-container">
      <Header title={`OS #${os.id.slice(0, 8).toUpperCase()}`} />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/lista-os')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="card">
          <div className="flex justify-between items-start mb-3">
            <span className={`${STATUS_OS_COLORS[os.status]} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
              {STATUS_OS_LABELS[os.status]}
            </span>
            <p className="text-xs text-slate-400">{formatDate(os.data_entrada)}</p>
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-lg font-bold">{os.cliente?.nome || 'Cliente'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{os.cliente?.telefone ? `(${os.cliente.telefone.slice(0, 2)}) ${os.cliente.telefone.slice(2)}` : ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {os.cliente?.telefone && (
              <>
                <button onClick={() => window.open(`https://wa.me/55${os.cliente!.telefone.replace(/\D/g, '')}`, '_blank')} className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm">
                  <Phone size={16} /> Ligar
                </button>
                <button onClick={() => enviarWhatsApp(`Olá ${os.cliente?.nome}, seu aparelho (${os.aparelho}) está ${STATUS_OS_LABELS[os.status].toLowerCase()}. Qualquer dúvida estamos à disposição!`)} className="btn-success flex items-center justify-center gap-2 py-3 text-sm">
                  <MessageCircle size={16} /> WhatsApp
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase">Informações do Aparelho</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Aparelho</p>
              <p className="font-medium">{os.aparelho}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Valor</p>
              <p className="font-medium text-emerald-600">R$ {os.valor.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400">Defeito</p>
            <p className="text-sm mt-1">{os.defeito || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Observações</p>
            <p className="text-sm mt-1">{os.observacoes || '-'}</p>
          </div>
          {os.pecas_usadas && (
            <div>
              <p className="text-xs text-slate-400">Peças Usadas</p>
              <p className="text-sm mt-1">{os.pecas_usadas}</p>
            </div>
          )}
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase">Atualizar Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.map((status, idx) => {
              const isActive = idx === currentIdx;
              const isPast = idx < currentIdx;
              return (
                <button
                  key={status}
                  onClick={() => mudarStatus(status)}
                  disabled={isActive}
                  className={`py-3 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                    isActive
                      ? `${STATUS_OS_COLORS[status]} text-white`
                      : isPast
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                  }`}
                >
                  {isActive && <CheckCircle size={14} />}
                  {STATUS_OS_LABELS[status]}
                </button>
              );
            })}
          </div>
        </div>

        {os.cliente?.telefone && os.status === 'pronto' && (
          <button onClick={() => enviarWhatsApp(`Olá ${os.cliente?.nome}! Seu aparelho (${os.aparelho}) está pronto para retirada. Valor: R$ ${os.valor.toFixed(2)}. Aguardamos você!`)} className="btn-success flex items-center justify-center gap-2">
            <MessageCircle size={20} /> Enviar "Aparelho Pronto"
          </button>
        )}

        <button onClick={() => { localDB.os.delete(os.id); navigate('/lista-os'); }} className="btn-danger flex items-center justify-center gap-2">
          <Ban size={20} /> Excluir OS
        </button>
      </div>
    </div>
  );
}
