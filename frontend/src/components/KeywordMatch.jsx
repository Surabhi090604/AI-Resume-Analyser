export default function KeywordMatch({ summary }) {
  if (!summary) return null;
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Keyword Coverage</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-slate-900">
              {summary.matched?.length || 0}/{(summary.matched?.length || 0) + (summary.missing?.length || 0)}
            </p>
            <span className="text-xl font-bold gradient-text">
              {summary.matched?.length ? Math.round((summary.matched.length / (summary.matched.length + summary.missing.length || 1)) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-3">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Matched Keywords
          </div>
          <div className="flex flex-wrap gap-2">
            {(summary.matched || []).map((keyword) => (
              <span key={keyword} className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                {keyword}
              </span>
            ))}
            {!summary.matched?.length && <p className="text-xs text-slate-500">No overlaps detected yet.</p>}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-amber-600 mb-3">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Missing Keywords
          </div>
          <div className="flex flex-wrap gap-2">
            {(summary.missing || []).map((keyword) => (
              <span key={keyword} className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                {keyword}
              </span>
            ))}
            {!summary.missing?.length && <p className="text-xs text-slate-500">No missing keywords 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

