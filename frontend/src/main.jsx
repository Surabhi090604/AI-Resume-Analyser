import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AnalyzerProvider } from './context/AnalyzerContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AnalyzerProvider>
        <App />
      </AnalyzerProvider>
    </BrowserRouter>
  </StrictMode>
);
