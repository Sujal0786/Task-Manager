export default function Alert({ type = 'info', children, onClose }) {
  const styles =
    type === 'success'
      ? 'bg-emerald-50 text-emerald-900 ring-emerald-600/20'
      : type === 'error'
        ? 'bg-rose-50 text-rose-900 ring-rose-600/20'
        : 'bg-slate-50 text-slate-800 ring-slate-600/10';

  return (
    <div className={`rounded-lg px-4 py-3 text-sm ring-1 ${styles} flex items-start justify-between gap-3`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-800">
          Dismiss
        </button>
      )}
    </div>
  );
}
