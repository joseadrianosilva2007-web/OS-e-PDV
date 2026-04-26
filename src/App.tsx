import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NovaOSPage from './pages/NovaOSPage';
import ListaOSPage from './pages/ListaOSPage';
import DetalheOSPage from './pages/DetalheOSPage';
import NovaVendaPage from './pages/NovaVendaPage';
import PDVPage from './pages/PDVPage';
import ProdutosPage from './pages/ProdutosPage';
import ClientesPage from './pages/ClientesPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/nova-os" element={<RequireAuth><NovaOSPage /></RequireAuth>} />
      <Route path="/lista-os" element={<RequireAuth><ListaOSPage /></RequireAuth>} />
      <Route path="/os/:id" element={<RequireAuth><DetalheOSPage /></RequireAuth>} />
      <Route path="/nova-venda" element={<RequireAuth><NovaVendaPage /></RequireAuth>} />
      <Route path="/pdv" element={<RequireAuth><PDVPage /></RequireAuth>} />
      <Route path="/produtos" element={<RequireAuth><ProdutosPage /></RequireAuth>} />
      <Route path="/clientes" element={<RequireAuth><ClientesPage /></RequireAuth>} />
      <Route path="/relatorios" element={<RequireAuth><RelatoriosPage /></RequireAuth>} />
      <Route path="/configuracoes" element={<RequireAuth><ConfiguracoesPage /></RequireAuth>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
