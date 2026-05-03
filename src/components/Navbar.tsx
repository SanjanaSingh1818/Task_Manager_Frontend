import { NavLink, useNavigate } from 'react-router-dom';
import { CheckSquare, LayoutDashboard, FolderOpen, ListTodo, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/authHandle';

export default function Navbar() {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderOpen },
    { to: '/tasks', label: 'Tasks', icon: ListTodo },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">TaskFlow</h1>
              <p className="text-xs text-slate-500">Team Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-700">
              {isAdmin ? <Shield className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
              <p className="text-xs capitalize text-slate-500">{profile?.role || 'member'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-tight text-white">TaskFlow</h1>
              <p className="truncate text-xs text-slate-500">{profile?.full_name || 'Team Manager'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-slate-800 bg-slate-900/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
