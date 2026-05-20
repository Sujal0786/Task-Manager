import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">TaskFlow</div>
          <div className="text-lg font-bold text-slate-900">Manager</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/" className={navItemClass} end>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={navItemClass}>
            <span>Projects</span>
          </NavLink>
          <NavLink to="/my-tasks" className={navItemClass}>
            <span>My Tasks</span>
          </NavLink>
        </nav>
        <div className="mt-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          Signed in as <span className="font-semibold text-slate-800">{user?.name}</span>
          <div className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
            {user?.role}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="text-sm font-bold text-slate-900">TaskFlow</span>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-sm text-slate-500">Workspace</span>
              <span className="text-sm font-semibold text-slate-900">Main</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto text-xs font-medium">
              <NavLink to="/" className={navItemClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/projects" className={navItemClass}>
                Projects
              </NavLink>
              <NavLink to="/my-tasks" className={navItemClass}>
                My Tasks
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
