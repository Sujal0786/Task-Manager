import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200">
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
  </div>
);

const ProgressBar = ({ value }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.stats);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner label="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? 'Organization-wide snapshot of projects and work in flight.'
              : 'Your assigned work across projects you are part of.'}
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          View projects
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Tasks" value={stats.totalTasks} hint="Visible to your role" />
        <StatCard label="Overdue" value={stats.overdue} hint="Incomplete & past due" />
        <StatCard label="High priority" value={stats.highPriority} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Completion rate</h2>
            <span className="text-sm font-bold text-brand-700">{stats.completionRate}%</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Share of tasks marked completed.</p>
          <div className="mt-4">
            <ProgressBar value={stats.completionRate} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Status mix</h2>
          <p className="mt-1 text-xs text-slate-500">How work is distributed across stages.</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Todo</dt>
              <dd className="font-semibold text-slate-900">{stats.todo}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">In progress</dt>
              <dd className="font-semibold text-slate-900">{stats.inProgress}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Completed</dt>
              <dd className="font-semibold text-emerald-700">{stats.completed}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
