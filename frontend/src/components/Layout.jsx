import { NavLink, Outlet } from 'react-router-dom';
import { useAnalyzer } from '../context/AnalyzerContext.jsx';
import ChatBot from './ChatBot.jsx';

const links = [
  { 
    to: '/upload', 
    label: 'Upload Resume',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    )
  },
  { 
    to: '/job-description', 
    label: 'Job Description',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    to: '/analysis', 
    label: 'Analysis Dashboard',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    to: '/history', 
    label: 'History',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function Layout() {
  const { user } = useAnalyzer();

  return (
    <div className="min-h-screen">
      <header className="glass-panel sticky top-0 z-50 mb-8 mx-6 mt-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">AI Resume Analyzer</p>
              <h1 className="text-2xl font-bold gradient-text">ATS Intelligence</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs uppercase text-slate-500 font-medium">Logged in as</p>
              <p className="text-sm font-semibold text-slate-800">{user?.email || 'guest@demo.io'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold shadow-md">
              {(user?.email || 'G')[0].toUpperCase()}
            </div>
          </div>
        </div>
        <nav className="border-t border-slate-200/50 bg-slate-50/50 rounded-b-3xl">
          <div className="max-w-6xl mx-auto flex gap-2 px-8 py-2 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-fit ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-white hover:text-primary-600'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 pb-12">
        <Outlet />
      </main>
      <ChatBot />
    </div>
  );
}

