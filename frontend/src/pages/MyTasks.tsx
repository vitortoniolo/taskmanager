import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { STATUSES, TaskCard } from '../components/TaskCard';
import { ErrorAlert } from '../components/ui';
import { listMyTasks } from '../api/endpoints';
import type { Task } from '../types';

// tarefas atribuídas ao usuário logado, em todos os projetos
export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyTasks()
      .then(setTasks)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Minhas tarefas</h1>
        <p className="text-sm text-slate-400">
          Tarefas atribuídas a você em todos os projetos
        </p>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          Nenhuma tarefa atribuída a você.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STATUSES.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="board-col">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    {col.label}
                  </h2>
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-slate-500">Vazio</p>
                  ) : (
                    // clicar no card leva para a página do projeto
                    colTasks.map((task) => (
                      <Link key={task.id} to={`/projects/${task.projectId}`} className="block">
                        <TaskCard task={task} showProject />
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
