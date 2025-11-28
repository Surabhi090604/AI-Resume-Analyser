export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-600 text-sm">
      <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
      {label}
    </div>
  );
}

