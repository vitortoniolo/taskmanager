import { useState, type FormEvent, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Button, ErrorAlert, Input } from './ui';

const NAV_LINKS = [
  { to: '/', label: 'Projetos' },
  { to: '/my-tasks', label: 'Minhas tarefas' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="text-lg font-bold">Task Manager</span>
            </div>
            <nav className="flex gap-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-sm font-semibold text-cyan-400'
                      : 'text-sm text-slate-400 hover:text-cyan-400'
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProfile(true)}
              className="text-sm text-slate-400 hover:text-cyan-400 hover:underline"
              title="Editar perfil"
            >
              {user?.name}
            </button>
            <button onClick={logout} className="btn-outline">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

// modal de perfil: editar nome/senha ou excluir a conta
function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({ name, password: password || undefined });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) return;
    try {
      await deleteAccount();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Modal title="Meu perfil" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />
        <Input label="E-mail" value={user?.email ?? ''} disabled />
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Nova senha (opcional)"
          type="password"
          placeholder="Deixe em branco para manter a atual"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
        <button type="button" onClick={handleDelete} className="btn-danger w-full">
          Excluir minha conta
        </button>
      </form>
    </Modal>
  );
}
