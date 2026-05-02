import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListTodo, Calendar, User, Filter, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/authHandle';
import type { Task, TaskStatus } from '../types';

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; badge: string; icon: React.ElementType }> = {
  todo: { label: 'To Do', badge: 'bg-slate-800 text-slate-300', icon: Circle },
  in_progress: { label: 'In Progress', badge: 'bg-blue-950 text-blue-300', icon: Clock },
  completed: { label: 'Completed', badge: 'bg-emerald-950 text-emerald-300', icon: CheckCircle2 },
};

export default function TasksPage() {
  const { profile, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().split('T')[0];

  async function loadTasks() {
    try {
      const data = await api.tasks.list();
      setTasks((data || []) as Task[]);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
    setLoading(false);
  }

  useEffect(() => { if (profile) loadTasks(); }, [profile, isAdmin]);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    try {
      await api.tasks.update(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  }

  const filtered = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
        <p className="text-slate-400 mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-4 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ListTodo className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-white font-medium mb-1">No tasks found</p>
          <p className="text-slate-500 text-sm">
            {tasks.length === 0
              ? isAdmin ? 'Create tasks from a project page.' : 'You have no assigned tasks yet.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const config = STATUS_CONFIG[task.status];
            const StatusIcon = config.icon;
            const isOverdue = task.due_date && task.due_date < today && task.status !== 'completed';
            const canEdit = isAdmin || task.assigned_to === profile?.id;

            return (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors group"
              >
                <StatusIcon className={`w-5 h-5 flex-shrink-0 ${task.status === 'completed' ? 'text-emerald-400' : task.status === 'in_progress' ? 'text-blue-400' : 'text-slate-500'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {isOverdue && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {task.project && (
                      <Link
                        to={`/projects/${task.project_id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {task.project.name}
                      </Link>
                    )}
                    {task.assignee && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="w-3 h-3" /> {task.assignee.full_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                        <Calendar className="w-3 h-3" /> {task.due_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {canEdit ? (
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                      {config.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
