import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import { extractTextFromFile } from '../services/ocr.js';
import { analyzeWithLLM } from '../services/llm.js';
import { buildHeuristicInsights } from '../services/scoring.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }
});

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

async function resolveUser({ userEmail, userName }) {
  if (!userEmail || !isMongoConnected()) return null;
  try {
    const email = userEmail.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name: userName });
    } else if (userName && user.name !== userName) {
      user.name = userName;
      await user.save();
    }
    return user;
  } catch (e) {
    console.warn('resolveUser error (MongoDB not available):', e.message);
    return null;
  }
}

// POST /upload - receives file, extracts text and creates an Analysis record
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file required' });

    const { userEmail, userName } = req.body;
    const user = await resolveUser({ userEmail, userName });

    const text = await extractTextFromFile({ buffer: file.buffer, mimetype: file.mimetype });

    const heuristics = buildHeuristicInsights(text, '');

    let analysis = null;
    if (isMongoConnected()) {
      try {
        analysis = await Analysis.create({
          userId: user?._id,
          filename: file.originalname,
          mimetype: file.mimetype,
          extractedText: text,
          meta: {
            wordCount: heuristics.wordCount,
            charCount: text.length,
            uploadedAt: new Date()
          },
          result: heuristics
        });
      } catch (dbError) {
        console.warn('Database save failed, continuing without persistence:', dbError.message);
      }
    }

    res.json({
      analysisId: analysis?._id || 'temp-' + Date.now(),
      extractedText: text,
      preview: text.slice(0, 1000),
      heuristics,
      userId: user?._id || null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// POST /analyze - takes analysisId or raw text + jobDescription, runs LLM
router.post('/analyze', async (req, res) => {
  try {
    const { analysisId, jobDescription, text, userEmail, userName } = req.body;
    let extractedText = text || null;
    let analysis = null;
    let user = null;

    if (userEmail) {
      user = await resolveUser({ userEmail, userName });
    }

    if (analysisId && isMongoConnected()) {
      try {
        analysis = await Analysis.findById(analysisId);
        if (analysis) {
          extractedText = extractedText || analysis.extractedText;
          if (!analysis.userId && user?._id) {
            analysis.userId = user._id;
          }
        }
      } catch (dbError) {
        console.warn('Database lookup failed:', dbError.message);
      }
    }

    if (!extractedText) return res.status(400).json({ error: 'no text to analyze' });

    const llmResult = await analyzeWithLLM(extractedText, jobDescription || '');
    const parsed = llmResult.parsed || buildHeuristicInsights(extractedText, jobDescription || '');

    if (isMongoConnected() && analysis) {
      try {
        analysis.jobDescription = jobDescription;
        analysis.result = parsed;
        analysis.meta = {
          ...(analysis.meta || {}),
          wordCount: parsed.wordCount || analysis.meta?.wordCount || extractedText.split(/\s+/).length,
          charCount: extractedText.length,
          lastAnalyzedAt: new Date()
        };
        await analysis.save();
      } catch (dbError) {
        console.warn('Database save failed:', dbError.message);
      }
    } else if (isMongoConnected() && !analysis) {
      try {
        analysis = await Analysis.create({
          userId: user?._id,
          filename: 'inline',
          mimetype: 'text/plain',
          extractedText,
          jobDescription,
          result: parsed,
          meta: {
            wordCount: parsed.wordCount,
            charCount: extractedText.length,
            uploadedAt: new Date(),
            lastAnalyzedAt: new Date()
          }
        });
      } catch (dbError) {
        console.warn('Database create failed:', dbError.message);
      }
    }

    res.json({
      analysisId: analysis?._id || 'temp-' + Date.now(),
      raw: llmResult.raw,
      parsed,
      userId: (analysis?.userId || user?._id) || null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// GET /history/:userId - list analyses for user
router.get('/history/:userId', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json([]);
    }
    const { userId } = req.params;
    const items = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('filename result createdAt jobDescription meta')
      .lean();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

router.get('/analysis/:id', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const item = await Analysis.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

router.get('/history', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json([]);
    }
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email query param required' });
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return res.json([]);
    const items = await Analysis.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('filename result createdAt jobDescription meta')
      .lean();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

router.get('/stats/:userId', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({ total: 0 });
    }
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'invalid userId' });
    }
    const aggregates = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$userId',
          avgATS: { $avg: '$result.ats_score' },
          avgReadability: { $avg: '$result.readability_score' },
          avgSkills: { $avg: '$result.skills_match_score' },
          total: { $sum: 1 }
        }
      }
    ]);
    res.json(aggregates[0] || { total: 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// POST /chat - Chatbot endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    const { getChatResponse } = await import('../services/chat.js');
    const result = await getChatResponse(message, context);

    res.json({
      response: result.response,
      provider: result.provider || 'heuristic',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({
      error: String(e),
      response: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
      provider: 'error'
    });
  }
});

export default router;
