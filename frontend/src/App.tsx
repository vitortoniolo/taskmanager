import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import ProjectDetail from './pages/ProjectDetail';
import type { ReactNode } from 'react';

// rota protegida: manda para /login se não estiver autenticado
function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// se já estiver logado, vai direto para o dashboard
function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/my-tasks" element={<Protected><MyTasks /></Protected>} />
      <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
