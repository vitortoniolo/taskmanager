import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { STATUSES, TaskCard } from '../components/TaskCard';
import { Button, ErrorAlert, Input, Select, Textarea } from '../components/ui';
import {
  addProjectMember,
  createTask,
  deleteProject,
  deleteTask,
  getProject,
  listUsers,
  removeProjectMember,
  updateProject,
  updateTask,
} from '../api/endpoints';
import type { Project, Task, TaskStatus, User } from '../types';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // recarrega o projeto (tarefas + membros) depois de cada alteração
  async function loadProject() {
    if (!id) return;
    try {
      setProject(await getProject(id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
    listUsers().then(setAllUsers).catch(() => {});
  }, [id]);

  // move a tarefa para qualquer status, sem restrição de ordem
  async function handleMove(task: Task, status: TaskStatus) {
    try {
      await updateTask(task.id, { status });
      loadProject();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      loadProject();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDeleteProject() {
    if (!project) return;
    if (!confirm(`Excluir o projeto "${project.name}" e todas as suas tarefas?`)) return;
    try {
      await deleteProject(project.id);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-400">Carregando...</p>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <ErrorAlert message={error || 'Projeto não encontrado.'} />
        <Link to="/" className="link mt-4 inline-block text-sm">
          ← Voltar aos projetos
        </Link>
      </Layout>
    );
  }

  const tasks = project.tasks ?? [];

  return (
    <Layout>
      <Link to="/" className="link mb-4 inline-block text-sm">
        ← Voltar aos projetos
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-slate-400">{project.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={() => setShowNewTask(true)}>+ Nova tarefa</Button>
          <button onClick={() => setShowEditProject(true)} className="btn-outline">
            Editar projeto
          </button>
          <button onClick={handleDeleteProject} className="btn-danger">
            Excluir projeto
          </button>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* quadro de tarefas, uma coluna por status */}
      <div className="mb-10 mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
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
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpen={setEditingTask}
                      onMove={handleMove}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MembersPanel
        project={project}
        allUsers={allUsers}
        onChanged={loadProject}
        onError={setError}
      />

      {showNewTask && (
        <NewTaskModal
          project={project}
          onClose={() => setShowNewTask(false)}
          onCreated={() => {
            setShowNewTask(false);
            loadProject();
          }}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          project={project}
          onClose={() => setEditingTask(null)}
          onSaved={() => {
            setEditingTask(null);
            loadProject();
          }}
        />
      )}

      {showEditProject && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditProject(false)}
          onSaved={() => {
            setShowEditProject(false);
            loadProject();
          }}
        />
      )}
    </Layout>
  );
}

// painel de membros do projeto
function MembersPanel({
  project,
  allUsers,
  onChanged,
  onError,
}: {
  project: Project;
  allUsers: User[];
  onChanged: () => void;
  onError: (msg: string) => void;
}) {
  const members = project.users ?? [];
  const memberIds = new Set(members.map((u) => u.id));
  const candidates = allUsers.filter((u) => !memberIds.has(u.id));
  const [selectedUser, setSelectedUser] = useState('');

  async function handleAdd() {
    if (!selectedUser) return;
    try {
      await addProjectMember(project.id, selectedUser);
      setSelectedUser('');
      onChanged();
    } catch (err) {
      onError((err as Error).message);
    }
  }

  async function handleRemove(user: User) {
    if (!confirm(`Remover ${user.name} do projeto?`)) return;
    try {
      await removeProjectMember(project.id, user.id);
      onChanged();
    } catch (err) {
      onError((err as Error).message);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-lg font-semibold">Membros</h2>

      <ul className="mb-5 space-y-2">
        {members.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="avatar h-7 w-7 text-xs">{user.name[0]?.toUpperCase()}</span>
              <div>
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemove(user)}
              className="text-xs text-red-400 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      {/* só aparecem usuários que ainda não fazem parte do projeto */}
      {candidates.length > 0 && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Adicionar membro"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Selecione um usuário...</option>
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={!selectedUser}>
            Adicionar
          </Button>
        </div>
      )}
    </div>
  );
}

// modal de criação de tarefa
function NewTaskModal({
  project,
  onClose,
  onCreated,
}: {
  project: Project;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const members = project.users ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createTask({
        title,
        description: description || undefined,
        projectId: project.id,
        assigneeId: assigneeId || undefined,
      });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Nova tarefa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />
        <Input
          label="Título"
          placeholder="Ex: Criar tela de login"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="Descrição (opcional)"
          placeholder="Detalhes da tarefa"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          label="Responsável (opcional)"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Sem responsável</option>
          {members.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Criando...' : 'Criar tarefa'}
        </Button>
      </form>
    </Modal>
  );
}

// modal de edição de tarefa, aberto ao clicar no card
function EditTaskModal({
  task,
  project,
  onClose,
  onSaved,
}: {
  task: Task;
  project: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const members = project.users ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateTask(task.id, {
        title,
        description,
        status,
        // select vazio significa "sem responsável"; null remove na api
        assigneeId: assigneeId || null,
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Editar tarefa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          label="Descrição"
          placeholder="Descreva a tarefa em detalhes"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s.status} value={s.status}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select
          label="Responsável"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Sem responsável</option>
          {members.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </Modal>
  );
}

// modal de edição do projeto
function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProject(project.id, { name, description });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Editar projeto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          label="Descrição"
          placeholder="Do que se trata este projeto?"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </Modal>
  );
}
