import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { formatDate, isOverdue, priorityBadgeClass, statusBadgeClass, STATUS_OPTIONS } from '../utils/format.js';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tasks/my');
      setTasks(data.tasks);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (task, status) => {
    try {
      await api.put(`/tasks/${task._id}`, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to update task');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner label="Loading your tasks…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My tasks</h1>
        <p className="text-sm text-slate-500">Everything currently assigned to you across projects.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          You have no assigned tasks yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <div key={t._id} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{t.title}</h2>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{t.description}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${priorityBadgeClass(t.priority)}`}>
                    {t.priority}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{t.projectId?.title}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ring-1 ring-inset ${statusBadgeClass(t.status)}`}>
                    {t.status}
                  </span>
                  <span className={overdue ? 'font-semibold text-rose-600' : ''}>Due {formatDate(t.dueDate)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link to={`/projects/${t.projectId?._id}`} className="text-xs font-semibold text-brand-700 hover:text-brand-900">
                    Open project →
                  </Link>
                  <select
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                    value={t.status}
                    onChange={(e) => updateStatus(t, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
