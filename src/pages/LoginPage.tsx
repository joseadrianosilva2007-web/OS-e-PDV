import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(usuario, senha)) {
      navigate('/');
    } else {
      setErro('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Wrench size={32} className="text-white" />
          </div>
          <div className="bg-emerald-500 p-3 rounded-xl">
            <ShoppingCart size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">OS+PDV Manager</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">Sistema para Assistência Técnica</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={e => { setUsuario(e.target.value); setErro(''); }}
            className="input-field text-center"
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => { setSenha(e.target.value); setErro(''); }}
            className="input-field text-center"
          />
          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          <button type="submit" className="btn-primary">Entrar</button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">Usuário padrão: admin / 123456</p>
      </div>
    </div>
  );
}
