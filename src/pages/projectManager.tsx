import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, ArrowRight, Trash2, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/authHandle';
import Modal from '../components/Modal';
import type { Project } from '../types';

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const projects = await api.projects.list();
      setProjects(projects);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.projects.create(name.trim(), description.trim());
      setName('');
      setDescription('');
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.projects.delete(id);
      setProjects(p => p.filter(x => x.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-white font-medium mb-1">No projects yet</p>
          <p className="text-slate-500 text-sm">
            {isAdmin ? 'Create your first project to get started.' : 'Projects will appear here once created.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 hover:border-slate-700 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg leading-tight">{project.name}</h3>
                {project.description && (
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  View Tasks <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Website Redesign"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional project description"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
              >
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
