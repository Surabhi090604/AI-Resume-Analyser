import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import UploadPage from './pages/UploadPage.jsx';
import JobDescriptionPage from './pages/JobDescriptionPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/job-description" element={<JobDescriptionPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
