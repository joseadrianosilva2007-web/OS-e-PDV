import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Trash2, Moon, Sun, UserPlus, Users } from 'lucide-react';
import { localDB } from '../lib/db';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function ConfiguracoesPage() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [modalUsuario, setModalUsuario] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [senha, setSenha] = useState('');

  const exportar = () => {
    const data = localDB.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ospdv_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localDB.importAll(String(reader.result));
        alert('Dados importados com sucesso!');
      } catch {
        alert('Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const limparDados = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados. Tem certeza?')) {
      localDB.clearAll();
      window.location.reload();
    }
  };

  const salvarUsuario = () => {
    if (!nomeUsuario.trim() || !usuarioLogin.trim() || !senha.trim()) return;
    localDB.usuarios.save({
      id: crypto.randomUUID(),
      nome: nomeUsuario.trim(),
      usuario: usuarioLogin.trim(),
      senha: senha.trim(),
    });
    setModalUsuario(false);
    setNomeUsuario('');
    setUsuarioLogin('');
    setSenha('');
    alert('Usuário criado!');
  };

  const usuarios = localDB.usuarios.getAll();

  return (
    <div className="page-container">
      <Header title="Configurações" />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="card">
          <h3 className="font-semibold text-sm text-slate-500 mb-3">Aparência</h3>
          <button onClick={toggle} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-sm font-medium">{dark ? 'Modo Claro' : 'Modo Escuro'}</span>
            </div>
            <span className="text-xs text-slate-400">{dark ? 'Ativado' : 'Desativado'}</span>
          </button>
        </div>

        <div className="card">
          <h3 className="font-semibold text-sm text-slate-500 mb-3">Backup de Dados</h3>
          <div className="space-y-2">
            <button onClick={exportar} className="btn-secondary py-3 text-sm flex items-center justify-center gap-2">
              <Download size={16} /> Exportar Backup
            </button>
            <label className="btn-secondary py-3 text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={16} /> Importar Backup
              <input type="file" accept=".json" onChange={importar} className="hidden" />
            </label>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-sm text-slate-500 mb-3 flex items-center gap-2">
            <Users size={16} /> Usuários
          </h3>
          <div className="space-y-2 mb-3">
            {usuarios.map((u: any) => (
              <div key={u.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span>{u.nome} <span className="text-slate-400">({u.usuario})</span></span>
              </div>
            ))}
          </div>
          <button onClick={() => setModalUsuario(true)} className="btn-secondary py-3 text-sm flex items-center justify-center gap-2">
            <UserPlus size={16} /> Novo Usuário
          </button>
        </div>

        <div className="card">
          <h3 className="font-semibold text-sm text-red-500 mb-3">Zona de Perigo</h3>
          <button onClick={limparDados} className="btn-danger py-3 text-sm flex items-center justify-center gap-2">
            <Trash2 size={16} /> Limpar Todos os Dados
          </button>
        </div>
      </div>

      {modalUsuario && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <h3 className="font-bold text-lg">Novo Usuário</h3>
            <input type="text" placeholder="Nome completo" value={nomeUsuario} onChange={e => setNomeUsuario(e.target.value)} className="input-field" />
            <input type="text" placeholder="Usuário (login)" value={usuarioLogin} onChange={e => setUsuarioLogin(e.target.value)} className="input-field" />
            <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input-field" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setModalUsuario(false)} className="btn-secondary py-3 text-sm">Cancelar</button>
              <button onClick={salvarUsuario} className="btn-success py-3 text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
