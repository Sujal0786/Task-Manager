export const STATUS_OPTIONS = ['Todo', 'In Progress', 'Completed'];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export const statusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'In Progress':
      return 'bg-amber-50 text-amber-800 ring-amber-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/10';
  }
};

export const priorityBadgeClass = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    case 'Medium':
      return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-600/10';
  }
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  const due = new Date(dueDate);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return due < start;
};
