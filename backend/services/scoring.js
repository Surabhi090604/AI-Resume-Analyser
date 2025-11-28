const SECTIONS = ['summary', 'experience', 'education', 'projects', 'skills'];

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function countWords(text) {
  return tokenize(text).length;
}

function fleschReadingEase(text) {
  const sentences = (text.match(/[.!?]/g) || []).length || 1;
  const words = countWords(text) || 1;
  const syllables = tokenize(text).reduce((acc, word) => acc + estimateSyllables(word), 0) || 1;
  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;
  const score = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function estimateSyllables(word) {
  if (!word) return 0;
  const vowels = word.match(/[aeiouy]+/g);
  if (!vowels) return 1;
  let count = vowels.length;
  if (word.endsWith('e')) count -= 1;
  return Math.max(count, 1);
}

function detectSections(text) {
  const lines = (text || '').split('\n');
  const buckets = {
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: []
  };

  let current = 'summary';
  for (const line of lines) {
    const normalized = line.trim().toLowerCase();
    if (/experience/.test(normalized)) current = 'experience';
    else if (/education/.test(normalized)) current = 'education';
    else if (/project/.test(normalized)) current = 'projects';
    else if (/skill/.test(normalized) || /technolog/.test(normalized)) current = 'skills';
    else if (/summary|profile|objective/.test(normalized)) current = 'summary';

    if (line.trim()) buckets[current].push(line.trim());
  }

  return buckets;
}

function deriveSectionCompleteness(buckets) {
  const present = SECTIONS.filter((section) => (buckets[section] || []).length > 0);
  return Math.round((present.length / SECTIONS.length) * 100);
}

function computeKeywordCoverage(text, jobDescription) {
  const jdTokens = Array.from(new Set(tokenize(jobDescription))).filter((token) => token.length > 3);
  const textTokens = new Set(tokenize(text));

  const matched = [];
  const missing = [];

  jdTokens.forEach((token) => {
    if (textTokens.has(token)) matched.push(token);
    else missing.push(token);
  });

  const coverage = jdTokens.length ? Math.round((matched.length / jdTokens.length) * 100) : 0;
  return { matched: matched.slice(0, 25), missing: missing.slice(0, 25), coverage };
}

export function buildHeuristicInsights(extractedText, jobDescription = '') {
  const buckets = detectSections(extractedText);
  const keywordSummary = computeKeywordCoverage(extractedText, jobDescription);
  const readability = fleschReadingEase(extractedText);
  const wordCount = countWords(extractedText);

  return {
    ats_score: Math.min(100, Math.round(50 + keywordSummary.coverage * 0.4)),
    readability_score: readability,
    section_completeness: deriveSectionCompleteness(buckets),
    skills_match_score: keywordSummary.coverage,
    keyword_summary: keywordSummary,
    extracted: {
      skills: Array.from(
        new Set(
          (buckets.skills || [])
            .join(' ')
            .split(/[,•\-]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 1)
        )
      ).slice(0, 25),
      experience: (buckets.experience || [])
        .slice(0, 6)
        .map((line) => ({ role: line, company: '', duration: '', summary: line })),
      education: (buckets.education || [])
        .slice(0, 4)
        .map((line) => ({ institution: line, degree: '', year: '' })),
      projects: (buckets.projects || [])
        .slice(0, 4)
        .map((line) => ({ name: line, description: line, impact: '' }))
    },
    strengths: ['Includes core resume sections', 'Readable structure'],
    weaknesses: keywordSummary.coverage < 60 ? ['Job keywords missing'] : [],
    recommendations:
      keywordSummary.missing.slice(0, 3).map((word) => `Incorporate the keyword "${word}" where relevant.`) ||
      [],
    summary: 'Baseline heuristic insights (LLM disabled or fallback).',
    wordCount,
    mock: true
  };
}

