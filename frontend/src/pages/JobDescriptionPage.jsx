import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyzer } from '../context/AnalyzerContext.jsx';
import { runAnalysis } from '../lib/api.js';
import Loader from '../components/Loader.jsx';

export default function JobDescriptionPage() {
  const {
    analysisId,
    extractedText,
    jobDescription,
    setJobDescription,
    setAnalysisResult,
    setAnalysisId,
    setUserId,
    setExtractedText,
    user
  } = useAnalyzer();
  const [localJD, setLocalJD] = useState(jobDescription);
  const [customText, setCustomText] = useState(extractedText);
  const [status, setStatus] = useState({ loading: false, error: '', notice: '' });
  const navigate = useNavigate();

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!localJD?.trim()) return setStatus({ ...status, error: 'Job description is required.' });
    if (!analysisId && !customText?.trim()) {
      return setStatus({ ...status, error: 'Paste resume text if you skipped uploading a file.' });
    }
    setStatus({ loading: true, error: '', notice: '' });
    try {
      const response = await runAnalysis({
        analysisId,
        jobDescription: localJD,
        text: analysisId ? undefined : customText,
        user
      });
      setJobDescription(localJD);
      setAnalysisResult(response.parsed);
      setAnalysisId(response.analysisId);
      if (response.userId) setUserId(response.userId);
      if (!analysisId && customText) setExtractedText(customText);
      navigate('/analysis');
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg">
            3
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Paste Job Description</h2>
            <p className="text-sm text-slate-600">We match required skills to your resume and highlight gaps.</p>
          </div>
        </div>
        <textarea
          rows={10}
          className="input-modern resize-none"
          placeholder="Paste the job description here... We'll analyze how well your resume matches the requirements."
          value={localJD}
          onChange={(e) => setLocalJD(e.target.value)}
        />
      </section>

      {!analysisId && (
        <section className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">No upload? No problem.</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">Paste raw resume text below and we will analyze from it.</p>
          <textarea
            rows={6}
            className="input-modern resize-none"
            placeholder="Paste resume text here..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
        </section>
      )}

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleAnalyze}
          className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          disabled={status.loading}
        >
          {status.loading ? (
            <>
              <Loader label="Analyzing with AI..." />
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run AI Analysis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </>
          )}
        </button>
        {status.error && (
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 max-w-md">
            <p className="text-sm text-red-600 font-medium text-center">{status.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

