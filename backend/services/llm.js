import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildHeuristicInsights } from './scoring.js';

const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function normalizeParsed(data = {}, heuristics) {
  const base = {
    ats_score: heuristics.ats_score,
    readability_score: heuristics.readability_score,
    section_completeness: heuristics.section_completeness,
    skills_match_score: heuristics.skills_match_score,
    keyword_summary: heuristics.keyword_summary,
    extracted: heuristics.extracted,
    strengths: heuristics.strengths,
    weaknesses: heuristics.weaknesses,
    recommendations: heuristics.recommendations,
    summary: heuristics.summary
  };

  return {
    ...base,
    ...data,
    keyword_summary: data.keyword_summary || base.keyword_summary,
    extracted: {
      ...base.extracted,
      ...(data.extracted || {})
    },
    strengths: data.strengths || base.strengths,
    weaknesses: data.weaknesses || base.weaknesses,
    recommendations: data.recommendations || base.recommendations,
    summary: data.summary || base.summary,
    mock: data.mock ?? false
  };
}

function buildPrompt(extractedText, jobDescription) {
  return `You are an expert ATS system. Carefully read the resume text and job description.
Return STRICT JSON with the following structure:
{
  "ats_score": number (0-100),
  "readability_score": number (0-100),
  "section_completeness": number (0-100),
  "skills_match_score": number (0-100),
  "keyword_summary": { "matched": string[], "missing": string[] },
  "extracted": {
    "skills": string[],
    "experience": [{ "role": string, "company": string, "duration": string, "summary": string }],
    "education": [{ "institution": string, "degree": string, "year": string }],
    "projects": [{ "name": string, "description": string, "impact": string }]
  },
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "summary": string
}
Resume:
"""${extractedText.slice(0, 8000)}"""
Job Description:
"""${jobDescription.slice(0, 4000)}"""`;
}

async function tryOpenAI(extractedText, jobDescription, heuristics) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  const client = new OpenAI({ apiKey: openaiKey });
  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze resumes for recruiters. Always return valid JSON and keep arrays concise (max 8 entries).'
        },
        { role: 'user', content: buildPrompt(extractedText, jobDescription) }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    let parsed = {};
    try {
      parsed = JSON.parse(reply);
    } catch (e) {
      const snippet = reply.match(/\{[\s\S]+\}/);
      if (snippet) parsed = JSON.parse(snippet[0]);
    }

    return {
      raw: reply,
      parsed: normalizeParsed(parsed, heuristics),
      mock: false,
      provider: 'openai'
    };
  } catch (error) {
    // Check if it's a quota/rate limit error - try Gemini fallback
    const isQuotaError = 
      error.status === 429 || 
      error.code === 'insufficient_quota' || 
      error.code === 'rate_limit_exceeded' ||
      (error.error && (error.error.code === 'insufficient_quota' || error.error.type === 'insufficient_quota'));
    
    if (isQuotaError) {
      console.warn('OpenAI quota exceeded, trying Gemini fallback...');
      return null; // Signal to try fallback
    }
    // For other errors, log and return null to try fallback
    console.warn('OpenAI call failed:', error.message || error.code);
    return null;
  }
}

async function tryGemini(extractedText, jobDescription, heuristics) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = buildPrompt(extractedText, jobDescription);
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    let parsed = {};
    try {
      parsed = JSON.parse(reply);
  } catch (e) {
      const snippet = reply.match(/\{[\s\S]+\}/);
      if (snippet) parsed = JSON.parse(snippet[0]);
    }

    return {
      raw: reply,
      parsed: normalizeParsed(parsed, heuristics),
      mock: false,
      provider: 'gemini'
    };
  } catch (error) {
    console.error('Gemini call failed', error);
    return null;
  }
}

export async function analyzeWithLLM(extractedText, jobDescription) {
  const heuristics = buildHeuristicInsights(extractedText, jobDescription);
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey && !geminiKey) {
    return { raw: null, parsed: { ...heuristics, mock: true }, mock: true, provider: 'none' };
  }

  // Try OpenAI first
  if (openaiKey) {
    try {
      const result = await tryOpenAI(extractedText, jobDescription, heuristics);
      if (result) return result;
    } catch (error) {
      console.error('OpenAI call failed', error.message);
    }
  }

  // Fallback to Gemini if OpenAI failed or quota exceeded
  if (geminiKey) {
    const result = await tryGemini(extractedText, jobDescription, heuristics);
    if (result) return result;
  }

  // Final fallback to heuristics
  console.warn('All LLM providers failed or unavailable, using heuristics');
  return {
    raw: null,
    parsed: { ...heuristics, mock: true },
    mock: true,
    provider: 'heuristic',
    error: 'LLM providers unavailable or quota exceeded'
  };
}
