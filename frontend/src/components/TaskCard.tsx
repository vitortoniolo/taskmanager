import type { Task, TaskStatus } from '../types';

const STATUS_STYLES: Record<TaskStatus, { label: string; classes: string }> = {
  TODO: { label: 'A fazer', classes: 'bg-slate-600/40 text-slate-300' },
  DOING: { label: 'Em progresso', classes: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' },
  DONE: { label: 'Concluída', classes: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.classes}`}>{s.label}</span>
  );
}

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-primary)]/50">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[var(--color-text)]">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      {task.description && (
        <p className="mb-3 text-sm text-[var(--color-muted)]">{task.description}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[10px] font-bold text-[var(--color-primary)]">
          {task.assignee?.name?.[0]?.toUpperCase() ?? '—'}
        </span>
        <span>{task.assignee?.name ?? 'Sem responsável'}</span>
      </div>
    </div>
  );
}
