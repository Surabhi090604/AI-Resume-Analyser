import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyzer } from '../context/AnalyzerContext.jsx';
import { fetchHistory } from '../lib/api.js';
import Loader from '../components/Loader.jsx';

export default function HistoryPage() {
  const { user, userId } = useAnalyzer();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email && !userId) return;
    let active = true;
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchHistory({ userId, email: user?.email });
        if (active) {
          setHistory(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadHistory();
    return () => {
      active = false;
    };
  }, [user?.email, userId]);

  if (!user?.email && !userId) {
    return <p className="text-sm text-slate-500">Provide an email on the upload page to save history.</p>;
  }

  if (loading) return <Loader label="Fetching history..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold gradient-text">Recent Analyses</h2>
          <p className="text-sm text-slate-600">View your past resume analysis results</p>
        </div>
      </div>
      {error && (
        <div className="glass-panel p-4 bg-red-50 border-2 border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      <div className="space-y-4">
        {history.length === 0 && (
          <div className="glass-panel p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base text-slate-500 font-medium">No analyses yet</p>
            <p className="text-sm text-slate-400 mt-2">Run your first analysis to see results here!</p>
          </div>
        )}
        {history.map((item) => (
          <div key={item._id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:scale-[1.02] transition-transform">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-slate-900 truncate">{item.filename}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {item.jobDescription && (
                <p className="text-xs text-slate-400 truncate max-w-xl ml-13">{item.jobDescription.slice(0, 180)}</p>
              )}
            </div>
            <div className="flex gap-4 text-sm flex-shrink-0">
              <Metric label="ATS" value={item.result?.ats_score} />
              <Metric label="Skills" value={item.result?.skills_match_score} />
              <Metric label="Readability" value={item.result?.readability_score} />
            </div>
            <button
              className="btn-primary px-5 py-2.5 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              onClick={() => navigate(`/analysis/${item._id}`)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value ?? '—'}</p>
    </div>
  );
}

