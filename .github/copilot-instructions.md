<!-- Generated guidance for AI coding assistants working on this repository. -->
# Copilot / Agent Instructions — ai-resume-analyser

This file contains concise, actionable guidance for AI coding assistants to be productive in this repository.

Summary (big picture)
- **Backend-only small service**: the `backend/` folder hosts an Express server that accepts a resume file, extracts text (PDF/DOCX), and calls the Google Generative AI SDK to return structured analysis.
- **Single HTTP entrypoint**: `POST /analyze` on port `3000` (see `backend/index.js`).

Key files to read first
- `backend/index.js` — main server and the best place to understand runtime flow: multer upload -> pdf-parse/mammoth -> prompt -> `@google/generative-ai`.
- `backend/package.json` — dependency list and `type` currently set to `commonjs` (see notes below).
- `backend/.env` — contains `GEMINI_API_KEY` used by the SDK (do not commit secrets).

Startup & developer workflow
- Install backend deps: `cd backend && npm install`.
- Run dev server (two options depending on module system):
  - Preferred (make ESM): set `"type": "module"` in `backend/package.json`, then:
    - `cd backend && node index.js` (or `npm start` if a start script is added).
  - Alternative: rename `index.js` to `index.mjs` OR convert `import` to `require` and change code to CommonJS.
- If you see: `SyntaxError: Cannot use import statement outside a module` — that means Node is running CommonJS; change `type` to `module` or switch to `.mjs` as above.
- Useful quick command (trace warnings):
```
cd backend
node --trace-warnings index.js
```

Runtime details & concrete examples
- Endpoint: `POST http://localhost:3000/analyze` — expects multipart/form-data with field `file`.
- Supported file types (checked in code):
  - `application/pdf` — parsed with `pdf-parse`.
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` — parsed with `mammoth`.
- Prompting pattern: the server builds a text prompt that asks the model to return a JSON object with fields `ats_score`, `strengths`, `weaknesses`, `missing_keywords`, and `recommendations`.
- SDK usage example (from `backend/index.js`):
  - `const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);`
  - `const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" });`
  - `const result = await model.generateContent(prompt);`

Project-specific conventions and gotchas
- Env loading: `dotenv.config()` is used in `backend/index.js` — look at `backend/.env` for the `GEMINI_API_KEY` variable.
- Duplicate dependencies: both root `package.json` and `backend/package.json` list dependencies; treat the `backend` package as the authoritative runtime manifest for the server.
- Response handling: code calls `res.json(result.response.text())`. When editing, confirm the shape returned by the SDK (it might be an object whose `.text()` must be awaited or parsed). Do not assume JSON — inspect runtime results and adjust parsing accordingly.

Testing & debugging guidance
- There are no tests present — prefer small manual checks using `curl` or Postman to hit `/analyze`.
- Example `curl` to test PDF upload:
```
curl -v -F "file=@/path/to/resume.pdf" http://localhost:3000/analyze
```
- If you change module format or entrypoint, run `node --trace-warnings ...` to get detailed stack locations.

External integrations
- Uses `@google/generative-ai` — ensure `GEMINI_API_KEY` has correct permissions/quotas.
- File-processing libraries: `pdf-parse`, `mammoth`, and `multer` (for multipart handling).

When modifying code
- Preserve the upload -> parse -> prompt -> model -> response pipeline unless adding a new route. Keep parsing logic (pdf/mammoth) near `app.post('/analyze')` to avoid scattering responsibility.
- If adding tests, place them in a new `backend/test` folder and add `npm test` script in `backend/package.json`.

Security & secrets
- `backend/.env` contains `GEMINI_API_KEY`. Do not commit real keys to git. Prefer a `.env.example` file with placeholder values if you add examples.

Files worth referencing for PR reviewers
- `backend/index.js`, `backend/package.json`, `backend/.env`.

If something is unclear
- Ask for the expected model output shape and whether the server should validate/normalize the JSON returned from the model.

Please review and tell me if you want stricter examples (request/response payload examples), or if you want me to also add a simple `start` script and set `type: "module"` in `backend/package.json` to make running the server easier.
