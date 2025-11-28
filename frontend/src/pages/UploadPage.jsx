import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyzer } from '../context/AnalyzerContext.jsx';
import { uploadResume } from '../lib/api.js';
import ScoreCards from '../components/ScoreCards.jsx';
import Loader from '../components/Loader.jsx';

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const {
    user,
    setUser,
    setAnalysisId,
    setExtractedText,
    setAnalysisResult,
    setUserId,
    analysisResult
  } = useAnalyzer();
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      return setError('Please select a resume file first.');
    }
    setError('');
    setUploading(true);
    try {
      const response = await uploadResume({
        file: fileInputRef.current.files[0],
        user
      });
      setAnalysisId(response.analysisId);
      setUserId(response.userId);
      setExtractedText(response.extractedText);
      setAnalysisResult(response.heuristics);
      navigate('/job-description');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
            1
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Identify Yourself</h2>
            <p className="text-sm text-slate-600">We use this email to keep your analysis history in sync.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 mb-2 block">Full name</span>
            <input
              type="text"
              className="input-modern"
              placeholder="Alex Candidate"
              value={user?.name || ''}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 mb-2 block">Work email</span>
            <input
              type="email"
              className="input-modern"
              placeholder="alex@company.com"
              value={user?.email || ''}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg">
            2
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upload Resume</h2>
            <p className="text-sm text-slate-600">
              Supports PDF, DOCX and images. Files stay under 10 MB and live in-memory only.
            </p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleUpload}>
          <div
            className="border-2 border-dashed border-primary-300 rounded-2xl p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-700 mb-1">Drag & drop or click to browse</p>
            <p className="text-sm text-slate-500">
              {fileName || 'No file selected'}
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary w-full md:w-auto inline-flex items-center gap-2"
            disabled={uploading}
          >
            {uploading ? (
              <Loader label="Uploading..." />
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload & Continue</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
        </form>
      </section>

      {analysisResult && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900">Quick heuristic preview</h3>
            <p className="text-xs text-slate-500">LLM-powered analysis runs after you add a job description.</p>
          </div>
          <ScoreCards result={analysisResult} />
        </section>
      )}
    </div>
  );
}

