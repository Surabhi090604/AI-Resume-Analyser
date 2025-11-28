export default function Suggestions({ strengths = [], weaknesses = [], recommendations = [] }) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-6">
      <Section 
        label="Strengths" 
        color="text-emerald-600" 
        items={strengths}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <Section 
        label="Weaknesses" 
        color="text-amber-600" 
        items={weaknesses}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
      <Section 
        label="Recommendations" 
        color="text-primary-600" 
        items={recommendations} 
        ordered
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
      />
    </div>
  );
}

function Section({ label, items, color, ordered = false, icon }) {
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        <p className={`text-base font-bold ${color}`}>{label}</p>
      </div>
      {items?.length ? (
        ordered ? (
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            {items.map((item, idx) => (
              <li key={`${label}-${idx}`}>{item}</li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {items.map((item, idx) => (
              <li key={`${label}-${idx}`} className="pl-3 border-l-4 border-slate-200">
                {item}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="text-xs text-slate-500">No insights yet.</p>
      )}
    </div>
  );
}

