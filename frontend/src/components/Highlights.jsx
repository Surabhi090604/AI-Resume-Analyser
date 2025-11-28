const sections = [
  { 
    key: 'skills', 
    title: 'Skills', 
    accent: 'bg-blue-50', 
    text: 'text-blue-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  { 
    key: 'experience', 
    title: 'Experience', 
    accent: 'bg-emerald-50', 
    text: 'text-emerald-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    key: 'education', 
    title: 'Education', 
    accent: 'bg-purple-50', 
    text: 'text-purple-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M5 19l7-7 7 7" />
      </svg>
    )
  },
  { 
    key: 'projects', 
    title: 'Projects', 
    accent: 'bg-amber-50', 
    text: 'text-amber-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }
];

export default function Highlights({ extracted }) {
  if (!extracted) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {sections.map((section) => (
        <div key={section.key} className={`glass-panel p-6 ${section.accent}`}>
          <div className={`flex items-center gap-2 mb-4 ${section.text}`}>
            {section.icon}
            <p className={`text-base font-bold ${section.text}`}>{section.title}</p>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            {Array.isArray(extracted[section.key]) && extracted[section.key].length ? (
              extracted[section.key].map((item, idx) => (
                <div key={idx} className="border border-white/60 rounded-lg p-3 bg-white/70">
                  {typeof item === 'string' ? (
                    <p>{item}</p>
                  ) : (
                    <>
                      <p className="font-semibold">{item.role || item.name || item.degree || 'Entry'}</p>
                      {item.company && <p className="text-xs text-slate-500">{item.company}</p>}
                      {item.duration && <p className="text-xs text-slate-500">{item.duration}</p>}
                      <p className="text-sm">{item.summary || item.description}</p>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No {section.title.toLowerCase()} extracted yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

