import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function tryOpenAIChat(message, context) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  const client = new OpenAI({ apiKey: openaiKey });
  try {
    const systemPrompt = `You are a helpful AI assistant for a resume analysis platform. You help users understand their resume analysis results, improve their resumes, and answer questions about ATS (Applicant Tracking Systems) and job applications.

Be concise, friendly, and actionable. Provide specific, practical advice.`;

    let contextInfo = '';
    if (context?.analysisResult) {
      const { analysisResult } = context;
      contextInfo = `\n\nCurrent user's resume analysis:
- ATS Score: ${analysisResult.ats_score || 'N/A'}/100
- Skills Match: ${analysisResult.skills_match_score || 'N/A'}%
- Readability: ${analysisResult.readability_score || 'N/A'}/100
- Strengths: ${(analysisResult.strengths || []).slice(0, 3).join(', ')}
- Areas to improve: ${(analysisResult.weaknesses || []).slice(0, 3).join(', ')}
- Missing keywords: ${(analysisResult.keyword_summary?.missing || []).slice(0, 5).join(', ')}
- Recommendations: ${(analysisResult.recommendations || []).slice(0, 2).join('. ')}`;
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt + contextInfo },
        { role: 'user', content: message }
      ]
    });

    return {
      response: completion.choices?.[0]?.message?.content || '',
      provider: 'openai'
    };
  } catch (error) {
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return null; // Try fallback
    }
    throw error;
  }
}

async function tryGeminiChat(message, context) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let contextInfo = '';
    if (context?.analysisResult) {
      const { analysisResult } = context;
      contextInfo = `\n\nUser's resume analysis context:
- ATS Score: ${analysisResult.ats_score || 'N/A'}/100
- Skills Match: ${analysisResult.skills_match_score || 'N/A'}%
- Strengths: ${(analysisResult.strengths || []).slice(0, 3).join(', ')}
- Improvements needed: ${(analysisResult.weaknesses || []).slice(0, 3).join(', ')}`;
    }

    const prompt = `You are a helpful AI assistant for a resume analysis platform. Help users understand their resume analysis and improve their resumes. Be concise and actionable.

${contextInfo}

User question: ${message}

Provide a helpful, specific response:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      response: response.trim(),
      provider: 'gemini'
    };
  } catch (error) {
    console.error('Gemini chat error:', error);
    return null;
  }
}

export async function getChatResponse(message, context) {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await tryOpenAIChat(message, context);
      if (result) return result;
    } catch (error) {
      console.warn('OpenAI chat failed, trying Gemini:', error.message);
    }
  }

  // Fallback to Gemini
  if (process.env.GEMINI_API_KEY) {
    const result = await tryGeminiChat(message, context);
    if (result) return result;
  }

  // Final fallback: rule-based responses
  const lowerMessage = message.toLowerCase();
  let response = '';

  if (lowerMessage.includes('ats') || lowerMessage.includes('score')) {
    if (context?.analysisResult) {
      response = `Your current ATS score is ${context.analysisResult.ats_score || 'N/A'}/100. `;
      if (context.analysisResult.ats_score < 70) {
        response += `To improve, focus on incorporating missing keywords like: ${(context.analysisResult.keyword_summary?.missing || []).slice(0, 3).join(', ')}. Also ensure all key sections (experience, education, skills) are complete.`;
      } else {
        response += `Great score! Keep it up by maintaining keyword relevance and clear formatting.`;
      }
    } else {
      response = 'I can help you understand ATS scores once you upload and analyze a resume. ATS (Applicant Tracking System) scores measure how well your resume matches job requirements. Higher scores (70+) increase your chances of passing automated screening.';
    }
  } else if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
    if (context?.analysisResult?.recommendations) {
      response = `Here are key improvements for your resume:\n${context.analysisResult.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    } else {
      response = 'To improve your resume:\n1. Match keywords from job descriptions naturally\n2. Quantify achievements with metrics (e.g., "Increased sales by 30%")\n3. Ensure all sections are complete (experience, education, skills, projects)\n4. Use action verbs and clear formatting';
    }
  } else if (lowerMessage.includes('keyword')) {
    if (context?.analysisResult?.keyword_summary?.missing) {
      response = `Missing keywords to consider: ${context.analysisResult.keyword_summary.missing.slice(0, 5).join(', ')}. Try naturally incorporating these into your resume sections where relevant. Don't stuff keywords - use them contextually.`;
    } else {
      response = 'Keywords are crucial for ATS systems. Match terms from the job description in your resume naturally. Focus on skills, technologies, and industry terms mentioned in the job posting.';
    }
  } else if (lowerMessage.includes('skill')) {
    response = 'Skills should be: 1) Relevant to the job, 2) Specific (e.g., "Python" not just "Programming"), 3) Organized by category (Technical, Soft, Certifications). Include both hard and soft skills.';
  } else if (lowerMessage.includes('format') || lowerMessage.includes('layout')) {
    response = 'Resume formatting tips:\n- Use clear section headers\n- Consistent formatting throughout\n- 1-2 pages max\n- Use bullet points for readability\n- Save as PDF to preserve formatting\n- Avoid complex graphics that ATS can\'t read';
  } else {
    response = 'I can help you with:\n- Understanding your ATS score\n- Improving your resume\n- Keyword optimization\n- Formatting tips\n- Answering questions about job applications\n\nWhat would you like to know?';
  }

  return {
    response,
    provider: 'heuristic'
  };
}

