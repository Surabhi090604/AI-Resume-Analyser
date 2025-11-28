import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AnalyzerContext = createContext(null);
const STORAGE_KEY = 'resume-analyzer-state';

function loadInitialState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AnalyzerProvider({ children }) {
  const [state, setState] = useState(() => loadInitialState() || {});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      analysisId: state.analysisId || null,
      extractedText: state.extractedText || '',
      jobDescription: state.jobDescription || '',
      analysisResult: state.analysisResult || null,
      userId: state.userId || null,
      user: state.user || { email: '', name: '' },
      setAnalysisId: (analysisId) => setState((prev) => ({ ...prev, analysisId })),
      setExtractedText: (extractedText) => setState((prev) => ({ ...prev, extractedText })),
      setJobDescription: (jobDescription) => setState((prev) => ({ ...prev, jobDescription })),
      setAnalysisResult: (analysisResult) => setState((prev) => ({ ...prev, analysisResult })),
      setUser: (user) => setState((prev) => ({ ...prev, user })),
      setUserId: (userId) => setState((prev) => ({ ...prev, userId }))
    }),
    [state]
  );

  return <AnalyzerContext.Provider value={value}>{children}</AnalyzerContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalyzer() {
  const ctx = useContext(AnalyzerContext);
  if (!ctx) throw new Error('useAnalyzer must be used within AnalyzerProvider');
  return ctx;
}

