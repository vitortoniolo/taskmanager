import type { Task, TaskStatus } from '../types';

// nome e cor da etiqueta de cada status
const STATUS_BADGE: Record<TaskStatus, { label: string; classes: string }> = {
  TODO: { label: 'A fazer', classes: 'badge-todo' },
  DOING: { label: 'Em progresso', classes: 'badge-doing' },
  DONE: { label: 'Concluído', classes: 'badge-done' },
};

// colunas do quadro; os cards podem ir para qualquer status
export const STATUSES: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'A fazer' },
  { status: 'DOING', label: 'Em progresso' },
  { status: 'DONE', label: 'Concluído' },
];

export function StatusBadge({ status }: { status: TaskStatus }) {
  const badge = STATUS_BADGE[status];
  return <span className={`badge ${badge.classes}`}>{badge.label}</span>;
}

export function TaskCard({
  task,
  showProject = false,
  onOpen,
  onMove,
  onDelete,
}: {
  task: Task;
  showProject?: boolean;
  onOpen?: (task: Task) => void;
  onMove?: (task: Task, status: TaskStatus) => void;
  onDelete?: (task: Task) => void;
}) {
  const otherStatuses = STATUSES.filter((s) => s.status !== task.status);

  return (
    <div
      onClick={onOpen ? () => onOpen(task) : undefined}
      className={`card p-4 ${onOpen ? 'clickable' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-3 whitespace-pre-line text-sm text-slate-400">
          {task.description}
        </p>
      )}

      {showProject && task.project && (
        <p className="mb-3 text-xs text-slate-400">📁 {task.project.name}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="avatar h-6 w-6 text-xs">
          {task.assignee?.name?.[0]?.toUpperCase() ?? '—'}
        </span>
        <span>{task.assignee?.name ?? 'Sem responsável'}</span>
      </div>

      {/* os botões só aparecem quando a página passa os handlers */}
      {(onMove || onDelete) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-700 pt-3">
          {onMove &&
            otherStatuses.map((s) => (
              <button
                key={s.status}
                className="chip"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(task, s.status);
                }}
              >
                → {STATUS_BADGE[s.status].label}
              </button>
            ))}
          {onDelete && (
            <button
              className="chip-danger ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
