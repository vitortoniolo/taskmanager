import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { Button, ErrorAlert, Input } from '../components/ui';
import { createProject, listProjects } from '../api/endpoints';
import type { Project } from '../types';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // busca os projetos do usuário; chamada também após criar um projeto novo
  async function loadProjects() {
    try {
      setProjects(await listProjects());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus projetos</h1>
          <p className="text-sm text-slate-400">Clique em um projeto para ver suas tarefas</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Novo projeto</Button>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          Você ainda não tem projetos. Crie o primeiro no botão acima.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadProjects();
          }}
        />
      )}
    </Layout>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const taskCount = project.tasks?.length ?? 0;
  const memberCount = project.users?.length ?? 0;

  return (
    <Link to={`/projects/${project.id}`} className="card clickable block p-5">
      <h2 className="mb-1 text-lg font-semibold">{project.name}</h2>
      <p className="mb-4 line-clamp-2 min-h-10 text-sm text-slate-400">
        {project.description || 'Sem descrição'}
      </p>
      <div className="flex gap-4 text-xs text-slate-400">
        <span>📋 {taskCount} tarefa(s)</span>
        <span>👥 {memberCount} membro(s)</span>
      </div>
    </Link>
  );
}

function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createProject(name, description || undefined);
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Novo projeto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorAlert message={error} />
        <Input
          label="Nome"
          placeholder="Ex: Site institucional"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Descrição (opcional)"
          placeholder="Do que se trata este projeto?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Criando...' : 'Criar projeto'}
        </Button>
      </form>
    </Modal>
  );
}
