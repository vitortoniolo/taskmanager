import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { TaskCard } from '../components/TaskCard';
import { ErrorAlert } from '../components/ui';
import { getProject, listProjects } from '../api/endpoints';
import type { Project, Task, TaskStatus } from '../types';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'A fazer' },
  { status: 'DOING', label: 'Em progresso' },
  { status: 'DONE', label: 'Concluídas' },
];

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Carrega a lista de projetos do usuário ao montar.
  useEffect(() => {
    listProjects()
      .then((data) => {
        setProjects(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Quando um projeto é selecionado, busca o detalhe (que inclui as tarefas).
  useEffect(() => {
    if (!selectedId) return;
    getProject(selectedId)
      .then((project) => setTasks(project.tasks ?? []))
      .catch((err) => setError(err.message));
  }, [selectedId]);

  if (loading) {
    return (
      <Layout>
        <p className="text-[var(--color-muted)]">Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <ErrorAlert message={error} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Meus projetos</h1>
        <p className="text-sm text-[var(--color-muted)]">Selecione um projeto para ver suas tarefas</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-[var(--color-muted)]">
          Nenhum projeto ainda. Crie um projeto pela API para vê-lo aqui.
        </div>
      ) : (
        <>
          {/* Seletor de projetos como pills */}
          <div className="mb-8 flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedId === p.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Quadro de tarefas por status */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.status);
              return (
                <div key={col.status} className="rounded-xl bg-[var(--color-surface)]/40 p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      {col.label}
                    </h2>
                    <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colTasks.length === 0 ? (
                      <p className="px-1 py-4 text-center text-xs text-slate-600">Vazio</p>
                    ) : (
                      colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
}
