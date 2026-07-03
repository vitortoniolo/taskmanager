import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearToken, getToken, setToken } from '../api/client';
import * as apiEndpoints from '../api/endpoints';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (input: { name?: string; password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = 'tm_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  // guarda o usuário no localstorage sempre que ele muda
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  async function login(email: string, password: string) {
    const res = await apiEndpoints.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
  }

  async function register(name: string, email: string, password: string) {
    await apiEndpoints.register(name, email, password);
    // depois de registrar já faz o login
    await login(email, password);
  }

  // atualiza nome e/ou senha do usuário logado
  async function updateProfile(input: { name?: string; password?: string }) {
    if (!user) return;
    const updated = await apiEndpoints.updateUser(user.id, input);
    setUser({ ...user, name: updated.name, email: updated.email });
  }

  // exclui a conta e encerra a sessão
  async function deleteAccount() {
    if (!user) return;
    await apiEndpoints.deleteUser(user.id);
    logout();
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && !!getToken(),
      login,
      register,
      updateProfile,
      deleteAccount,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
