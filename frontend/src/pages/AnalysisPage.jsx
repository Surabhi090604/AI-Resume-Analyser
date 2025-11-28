import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAnalyzer } from '../context/AnalyzerContext.jsx';
import { fetchAnalysis } from '../lib/api.js';
import ScoreCards from '../components/ScoreCards.jsx';
import KeywordMatch from '../components/KeywordMatch.jsx';
import Highlights from '../components/Highlights.jsx';
import Suggestions from '../components/Suggestions.jsx';
import Loader from '../components/Loader.jsx';

export default function AnalysisPage() {
  const params = useParams();
  const {
    analysisId,
    analysisResult,
    setAnalysisResult,
    setAnalysisId,
    jobDescription,
    extractedText
  } = useAnalyzer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const targetId = params.analysisId;
    if (!targetId || targetId === analysisId) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const payload = await fetchAnalysis(targetId);
        if (!active) return;
        setAnalysisResult(payload.result);
        setAnalysisId(payload._id);
        setError('');
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [params.analysisId, analysisId, setAnalysisId, setAnalysisResult]);

  if (loading) return <Loader label="Loading analysis..." />;
  if (!analysisResult)
    return (
      <div className="glass-panel p-6 text-center text-slate-600">
        Upload a resume and run analysis to view insights.
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass-panel p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">AI Summary</p>
              <h2 className="text-3xl font-bold gradient-text">Match Report</h2>
            </div>
          </div>
          {analysisResult.mock ? (
            <span className="badge badge-warning">
              {analysisResult.error?.includes('quota') ? 'Quota exceeded - Using heuristics' : 'Heuristic analysis'}
            </span>
          ) : (
            <span className="badge badge-success">
              {analysisResult.provider === 'gemini' ? '🤖 Powered by Gemini AI' : '🤖 Powered by GPT-4o'}
            </span>
          )}
        </div>
        <p className="text-base text-slate-700 leading-relaxed mb-4">{analysisResult.summary}</p>
        <div className="flex gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
            <span>Resume: {extractedText?.length || '—'} chars</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-500"></div>
            <span>Job Description: {jobDescription?.length || '—'} chars</span>
          </div>
        </div>
      </section>

      <ScoreCards result={analysisResult} />
      <KeywordMatch summary={analysisResult.keyword_summary} />
      <Highlights extracted={analysisResult.extracted} />
      <Suggestions
        strengths={analysisResult.strengths}
        weaknesses={analysisResult.weaknesses}
        recommendations={analysisResult.recommendations}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

