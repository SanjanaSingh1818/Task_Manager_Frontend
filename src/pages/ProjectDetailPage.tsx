import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, User, CheckCircle2, Circle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/authHandle';
import Modal from '../components/Modal';
import type { AppUser, Project, Task, TaskStatus } from '../types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ElementType; classes: string }> = {
  todo: { label: 'To Do', icon: Circle, classes: 'bg-slate-800 text-slate-300 border-slate-700' },
  in_progress: { label: 'In Progress', icon: Clock, classes: 'bg-blue-950 text-blue-300 border-blue-900' },
  completed: { label: 'Completed', icon: CheckCircle2, classes: 'bg-emerald-950 text-emerald-300 border-emerald-900' },
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isAdmin } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', assigned_to: '', status: 'todo' as TaskStatus });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  async function loadData() {
    try {
      const projectData = await api.projects.get(id!);
      setProject(projectData);
      setTasks(projectData.tasks || []);
    } catch (err) {
      console.error('Error loading project:', err);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await api.users.list();
        console.log('[users] fetched users for assign dropdown:', fetchedUsers);
        setUsers(fetchedUsers as AppUser[]);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    }

    loadUsers();
  }, []);

  async function handleCreateTask(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.tasks.create(form.title.trim(), form.description.trim(), id!, form.assigned_to || undefined, form.due_date || undefined);
      setForm({ title: '', description: '', due_date: '', assigned_to: '', status: 'todo' as TaskStatus });
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    try {
      await api.tasks.update(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    try {
      await api.tasks.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-400">Project not found.</p>
        <Link to="/projects" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const grouped = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <Link to="/projects" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.description && <p className="text-slate-400 mt-1">{project.description}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-500">
              <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              <span>{grouped.completed.length} completed</span>
              {grouped.completed.length > 0 && tasks.length > 0 && (
                <span className="text-emerald-400">
                  {Math.round((grouped.completed.length / tasks.length) * 100)}% done
                </span>
              )}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex-shrink-0 sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white font-medium mb-1">No tasks in this project</p>
          <p className="text-slate-500 text-sm">{isAdmin ? 'Add tasks to get started.' : 'Tasks will appear here when assigned.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.entries(grouped) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            return (
              <div key={status} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-white font-medium text-sm">{config.label}</span>
                  <span className="ml-auto bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{statusTasks.length}</span>
                </div>
                <div className="p-3 space-y-3">
                  {statusTasks.length === 0 && (
                    <p className="text-slate-600 text-sm text-center py-4">No tasks</p>
                  )}
                  {statusTasks.map(task => {
                    const isOverdue = task.due_date && task.due_date < today && task.status !== 'completed';
                    const canEdit = isAdmin || task.assigned_to === profile?.id;
                    return (
                      <div key={task.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-white text-sm font-medium leading-snug">{task.title}</h4>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-slate-400 text-xs mb-3 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {task.assignee && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <User className="w-3 h-3" />
                              <span>{task.assignee.full_name}</span>
                            </div>
                          )}
                          {task.due_date && (
                            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                              <Calendar className="w-3 h-3" />
                              <span>{task.due_date}</span>
                            </div>
                          )}
                        </div>
                        {canEdit && (
                          <div className="mt-3">
                            <select
                              value={task.status}
                              onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                              className="w-full text-xs bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="New Task" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateTask} className="space-y-4">
            {error && <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Design landing page"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Optional details"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign To</label>
              <select
                value={form.assigned_to}
                onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
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
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
