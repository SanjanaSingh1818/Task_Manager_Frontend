import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, ListTodo, FolderOpen, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/authHandle';
import StatCard from '../components/StatCard';
import type { Task, Project, DashboardStats } from '../types';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, completed: 0, overdue: 0, in_progress: 0 });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!profile) {
      console.log('[dashboard] no profile; skipping dashboard fetch');
      setLoading(false);
      return;
    }

    const profileId = profile.id;

    async function load() {
      setLoading(true);
      try {
        console.log('[dashboard] loading data for profile:', profileId);
        const tasks = await api.tasks.list();
        const taskList = (tasks || []) as Task[];

        setStats({
          total: taskList.length,
          completed: taskList.filter(t => t.status === 'completed').length,
          in_progress: taskList.filter(t => t.status === 'in_progress').length,
          overdue: taskList.filter(t => t.due_date && t.due_date < today && t.status !== 'completed').length,
        });
        setRecentTasks(taskList.slice(0, 5));

        if (isAdmin) {
          const projects = await api.projects.list();
          setRecentProjects(projects.slice(0, 4));
        } else {
          setRecentProjects([]);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile?.id, isAdmin, today]);

  const statusBadge = (status: Task['status']) => {
    const map = {
      todo: 'bg-slate-800 text-slate-300',
      in_progress: 'bg-blue-950 text-blue-300',
      completed: 'bg-emerald-950 text-emerald-300',
    };
    const label = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{label[status]}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-400 mt-1">
          {isAdmin ? "Here's an overview of your team's work." : "Here's your task overview."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="blue" description={isAdmin ? 'Across all projects' : 'Assigned to you'} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" description="Finished tasks" />
        <StatCard label="In Progress" value={stats.in_progress} icon={Clock} color="amber" description="Currently active" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="red" description="Past due date" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">{isAdmin ? 'Recent Tasks' : 'My Tasks'}</h2>
            <Link to="/tasks" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentTasks.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm text-center">No tasks yet.</p>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{task.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">
                      {task.project?.name || 'No project'} {task.due_date && `· Due ${task.due_date}`}
                    </p>
                  </div>
                  {statusBadge(task.status)}
                </div>
              ))
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
              <Link to="/projects" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {recentProjects.length === 0 ? (
                <p className="p-6 text-slate-500 text-sm text-center">No projects yet.</p>
              ) : (
                recentProjects.map(project => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{project.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{project.description || 'No description'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-blue-950 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-1">Keep it up!</h3>
            <p className="text-slate-400 text-sm mb-4">
              You have {stats.total - stats.completed} task{stats.total - stats.completed !== 1 ? 's' : ''} remaining.
            </p>
            <Link
              to="/tasks"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View My Tasks
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
