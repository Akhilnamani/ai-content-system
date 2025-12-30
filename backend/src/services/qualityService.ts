// Quality scoring service for content analysis
interface QualityAnalysis {
  qualityScore: number; // 0-100
  qualityDetails: {
    wordCount: number;
    sentenceCount: number;
    readabilityScore: number; // Flesch-Kincaid
    structureScore: number;
    uniqueWordsRatio: number;
  };
  halluccinationRisk: 'high' | 'medium' | 'low' | 'none';
}

export const analyzeContentQuality = (content: string, contentType: string): QualityAnalysis => {
  console.log('📊 Analyzing content quality...');

  // 1. Word Count
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // 2. Sentence Count
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // 3. Flesch-Kincaid Readability Score
  const syllableCount = estimateSyllables(content);
  const readabilityScore = calculateFleschKincaid(wordCount, sentenceCount, syllableCount);

  // 4. Structure Score (presence of headings, lists, formatting)
  const structureScore = calculateStructureScore(content);

  // 5. Unique Words Ratio
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueWordsRatio = (uniqueWords.size / wordCount) * 100;

  // 6. Calculate Overall Quality Score (weighted)
  const qualityScore = calculateOverallQuality({
    wordCount,
    readabilityScore,
    structureScore,
    uniqueWordsRatio,
    contentType,
  });

  // 7. Detect Hallucination Risk
  const halluccinationRisk = detectHallucinationRisk(content);

  console.log(`✅ Quality Score: ${qualityScore}/100 | Risk: ${halluccinationRisk}`);

  return {
    qualityScore,
    qualityDetails: {
      wordCount,
      sentenceCount,
      readabilityScore,
      structureScore,
      uniqueWordsRatio,
    },
    halluccinationRisk,
  };
};

// Estimate syllable count (simplified)
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllables = 0;

  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '');
    if (word.length <= 3) {
      syllables += 1;
    } else {
      syllables += (word.match(/[aeiouy]/g) || []).length;
    }
  });

  return Math.max(1, syllables);
}

// Flesch-Kincaid Grade Level
function calculateFleschKincaid(
  wordCount: number,
  sentenceCount: number,
  syllableCount: number
): number {
  if (sentenceCount === 0 || wordCount === 0) return 0;

  const score =
    0.39 * (wordCount / sentenceCount) +
    11.8 * (syllableCount / wordCount) -
    15.59;

  return Math.max(0, Math.min(18, score)); // Clamp to 0-18 grade level
}

// Structure Score: presence of headings, formatting, lists
function calculateStructureScore(content: string): number {
  let score = 50; // Base score

  // Check for markdown headings (#, ##, ###)
  const headingCount = (content.match(/^#+\s/gm) || []).length;
  score += Math.min(20, headingCount * 5);

  // Check for lists (- or *)
  const listCount = (content.match(/^[\-\*]\s/gm) || []).length;
  score += Math.min(10, listCount * 2);

  // Check for line breaks and paragraphs
  const paragraphs = content.split(/\n\n+/).length;
  score += Math.min(10, paragraphs * 2);

  // Check for bold/italic formatting
  const formatting = (content.match(/\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_/g) || []).length;
  score += Math.min(10, formatting * 1);

  return Math.min(100, score);
}

// Overall Quality Calculation (weighted)
function calculateOverallQuality({
  wordCount,
  readabilityScore,
  structureScore,
  uniqueWordsRatio,
  contentType,
}: {
  wordCount: number;
  readabilityScore: number;
  structureScore: number;
  uniqueWordsRatio: number;
  contentType: string;
}): number {
  // Expected word counts by type
  const expectedWordCounts: { [key: string]: { min: number; ideal: number; max: number } } = {
    'Blog Post': { min: 300, ideal: 800, max: 2000 },
    Article: { min: 500, ideal: 1200, max: 3000 },
    Tutorial: { min: 800, ideal: 1500, max: 3000 },
    Guide: { min: 1000, ideal: 2000, max: 5000 },
    'Case Study': { min: 500, ideal: 1500, max: 3000 },
    'Research Paper': { min: 2000, ideal: 5000, max: 10000 },
  };

  const expected = expectedWordCounts[contentType] || { min: 300, ideal: 1000, max: 3000 };

  // Word count score
  let wordCountScore = 0;
  if (wordCount >= expected.min && wordCount <= expected.max) {
    wordCountScore = 100 - Math.abs(wordCount - expected.ideal) / (expected.ideal / 100);
  } else if (wordCount < expected.min) {
    wordCountScore = (wordCount / expected.min) * 100;
  } else {
    wordCountScore = 100 - (wordCount - expected.max) / 100;
  }
  wordCountScore = Math.max(0, Math.min(100, wordCountScore));

  // Readability score (normalize 0-18 to 0-100)
  const readabilityPercentage = (readabilityScore / 18) * 100;

  // Unique words (should be 40-60% for quality)
  let uniquenessScore = 100;
  if (uniqueWordsRatio < 40) {
    uniquenessScore = (uniqueWordsRatio / 40) * 100;
  } else if (uniqueWordsRatio > 60) {
    uniquenessScore = 100 - (uniqueWordsRatio - 60) / 4;
  }

  // Weighted calculation
  const weights = {
    wordCount: 0.25,
    readability: 0.25,
    structure: 0.3,
    uniqueness: 0.2,
  };

  const overallScore =
    wordCountScore * weights.wordCount +
    readabilityPercentage * weights.readability +
    structureScore * weights.structure +
    uniquenessScore * weights.uniqueness;

  return Math.round(overallScore);
}

// Detect Hallucination Risk
function detectHallucinationRisk(content: string): 'high' | 'medium' | 'low' | 'none' {
  let riskScore = 0;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /according to (a study|research)/gi,
    /recent (studies|research|data)/gi,
    /it has been (proven|shown|demonstrated)/gi,
    /scientists (have|say|agree)/gi,
    /\d{4}%\s+(of|increase|decrease)/gi, // Stats without sources
    /over \d+ (million|billion|thousand)/gi, // Large numbers
  ];

  suspiciousPatterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    riskScore += matches.length * 2;
  });

  // Check for lack of citations
  const citationPatterns = [/\[\d+\]/g, /\(source:\s*/gi, /according to .+:$/gim];
  const citationCount = citationPatterns.reduce((sum, pattern) => {
    return sum + (content.match(pattern) || []).length;
  }, 0);

  if (citationCount === 0) {
    riskScore += 5; // Penalty for no citations
  }

  // Check for vague language
  const vagueLanguage = [
    /may be|might be|could be|appears to|seems to/gi,
    /probably|possibly|allegedly|supposedly/gi,
  ];

  vagueLanguage.forEach(pattern => {
    const matches = content.match(pattern) || [];
    if (matches.length > 3) {
      riskScore += 2;
    }
  });

  // Risk classification
  if (riskScore >= 15) return 'high';
  if (riskScore >= 8) return 'medium';
  if (riskScore >= 3) return 'low';
  return 'none';
}
