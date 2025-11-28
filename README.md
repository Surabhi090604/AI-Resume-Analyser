# AI Resume Analyzer

Full-stack AI-powered resume reviewer with OCR ingestion, OpenAI GPT-4o analysis, ATS scoring, and interactive dashboards. Users upload resumes (PDF/DOCX/images), paste job descriptions, and receive actionable insights, history, and deployment-ready configs.

## Tech Stack

- **Frontend**: React + Vite, React Router, TailwindCSS, Recharts, Headless UI
- **Backend**: Node.js, Express, Multer, Tesseract OCR, pdf-parse, Mammoth, OpenAI SDK
- **Database**: MongoDB (Mongoose models for users + analyses)
- **AI**: GPT-4o/4o-mini via OpenAI API with heuristic fallbacks
- **Deployment**: Vercel/Netlify (frontend), Render/Railway (backend)

## High-Level Architecture

1. **Upload Service**: Multer (memory storage) accepts PDF/DOCX/images, `services/ocr` extracts text (pdf-parse → Mammoth → Tesseract fallback). Heuristic scores saved immediately.
2. **Analysis Service**: `/api/analyze` calls GPT-4o (or heuristics if API key missing) to produce ATS score, skills match, readability, keyword coverage, extracted entities (skills/experience/education/projects), strengths, weaknesses, and recommendations.
3. **Data Layer**: MongoDB stores `User` and `Analysis` documents, tracks metadata, and exposes history/stats.
4. **Frontend Experience**: Multi-page React app (upload → job description → analysis dashboard → history) with context persisted in localStorage.
5. **Deployment Pipelines**: Configured for Vercel/Netlify (frontend) and Render/Railway (backend) with environment variable templates.

## Local Development

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas or local instance
- OpenAI API key (GPT-4o/4o-mini). Optional: Gemini key for future extensibility.

### Backend
```bash
cd backend
npm install
cp .env.example .env   # if blocked, copy variables from README
npm start
```
Environment variables:

| Name | Description |
| --- | --- |
| `PORT` | Express port (default 3000) |
| `CLIENT_URL` | Allowed CORS origin (e.g., `http://localhost:5173`) |
| `MONGODB_URI` | Mongo connection string |
| `MONGO_DB_NAME` | Optional DB name override |
| `OPENAI_API_KEY` | GPT-4o/4o-mini access key |
| `OPENAI_MODEL` | Model name (default `gpt-4o-mini`) |

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # contains VITE_API_BASE_URL
npm run dev
```

Visit `http://localhost:5173`. Ensure `VITE_API_BASE_URL` points to the backend (default `http://localhost:3000`).

## API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/upload` | POST multipart | Upload resume file (PDF/DOCX/image). Returns `analysisId`, extracted text, heuristics. Accepts optional `userEmail`, `userName`. |
| `/api/analyze` | POST JSON | Runs GPT analysis. Body: `{ analysisId?, jobDescription, text?, userEmail?, userName? }`. Returns parsed scores and `userId`. |
| `/api/analysis/:id` | GET | Fetch a single analysis document. |
| `/api/history/:userId` | GET | Fetch last 50 analyses by userId (used internally). |
| `/api/history?email=` | GET | Fetch history for a user email (used by frontend). |
| `/api/stats/:userId` | GET | Aggregate stats for dashboards. |
| `/health` | GET | Service heartbeat + key presence. |

## Deployment

### Frontend
- **Vercel**: `frontend/vercel.json` sets build command and exposes `VITE_API_BASE_URL` secret (`backend_api_base`).
- **Netlify**: `frontend/netlify.toml` configures `npm run build` and publish directory.

### Backend
- **Render**: `backend/render.yaml` provisions a Node web service under `/backend`, installs deps, runs `npm start`, and expects env vars (`PORT`, `OPENAI_API_KEY`, `MONGODB_URI`, `CLIENT_URL`).
- **Railway**: `backend/railway.json` describes the Node service and required variables for easy import.

## Key Features

- OCR pipeline for PDFs, DOCX, and images (Tesseract fallback)
- GPT-4o analysis with JSON schema enforcement + heuristic merging
- ATS score, skills match, readability, section completeness, keyword coverage
- Extraction of skills, experience, education, projects
- Actionable strengths/weaknesses/recommendations
- MongoDB-backed user history and stats
- Modern React UI with TailwindCSS, charts, cards, and multi-page flow
- Environment templates + deployment configs for common PaaS targets

## Testing & Verification

- Upload sample files via `/frontend/test-sample.pdf` (copy into browser) or use curl with `/api/upload`.
- Confirm `/health` and `/api/analysis/:id` after running an analysis.
- The frontend context persists state in `localStorage`; clear storage for a fresh session.

## Future Enhancements

- Authentication/authorization for multi-user orgs
- Webhooks for scheduled monitoring
- Additional visualizations (trend lines, PDF previews)
- Support for multiple job descriptions per resume
