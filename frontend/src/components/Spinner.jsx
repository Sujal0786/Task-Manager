export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
