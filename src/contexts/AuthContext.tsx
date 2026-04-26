import { createContext, useContext, useState, useEffect } from 'react';
import { localDB } from '../lib/db';

interface User {
  id: string;
  nome: string;
  usuario: string;
}

interface AuthContextType {
  user: User | null;
  login: (usuario: string, senha: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => false, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ospdv_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (usuario: string, senha: string): boolean => {
    const users = localDB.usuarios.getAll();
    const found = users.find((u: any) => u.usuario === usuario && u.senha === senha);
    if (found) {
      const { id, nome, usuario } = found;
      const userObj = { id, nome, usuario };
      setUser(userObj);
      localStorage.setItem('ospdv_user', JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ospdv_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
