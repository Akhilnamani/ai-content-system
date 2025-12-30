interface FlaggedClaim {
  claim: string;
  riskLevel: 'high' | 'medium' | 'low';
  suggestion: string;
  sources?: string[];
}

export const performFactCheck = async (content: string): Promise<{
  flaggedClaims: FlaggedClaim[];
  factCheckStatus: 'verified' | 'flagged' | 'needs-review';
}> => {
  console.log('🔍 Starting fact-check analysis...');

  const flaggedClaims: FlaggedClaim[] = [];

  // Extract potential claims
  const claims = extractClaims(content);

  for (const claim of claims) {
    const result = await checkClaim(claim);
    if (result) {
      flaggedClaims.push(result);
    }
  }

  // Determine overall status
  let factCheckStatus: 'verified' | 'flagged' | 'needs-review' = 'verified';
  if (flaggedClaims.length > 0) {
    const highRiskCount = flaggedClaims.filter(c => c.riskLevel === 'high').length;
    factCheckStatus = highRiskCount > 0 ? 'flagged' : 'needs-review';
  }

  console.log(`✅ Fact-check complete: ${flaggedClaims.length} flagged claims`);

  return { flaggedClaims, factCheckStatus };
};

// Extract claims from content (sentences ending with facts)
function extractClaims(content: string): string[] {
  const sentences = content
    .split(/[.!?]\s+/)
    .filter(s => s.trim().length > 10)
    .slice(0, 10); // Limit to first 10 sentences for performance

  // Filter sentences that look like claims
  return sentences.filter(
    s =>
      /\d+|percent|study|research|found|showed|prove/.test(s.toLowerCase()) &&
      s.length < 200
  );
}

// Check individual claim
async function checkClaim(claim: string): Promise<FlaggedClaim | null> {
  // Pattern-based fact-checking (no API call)
  
  // 1. Check for unsupported statistics
  const statsMatch = claim.match(/(\d+%|\d+ (million|billion|thousand))/i);
  if (statsMatch && !claim.match(/\[\d+\]|\(source:|according to/i)) {
    return {
      claim: claim.substring(0, 100),
      riskLevel: 'medium',
      suggestion: `This claim includes statistics (${statsMatch[0]}). Please add sources or citations.`,
      sources: ['Add citation', 'Provide source link'],
    };
  }

  // 2. Check for unverifiable time claims
  if (claim.match(/recently|newly|just discovered|latest research/i)) {
    if (!claim.match(/20\d{2}|this year|2024|2025/i)) {
      return {
        claim: claim.substring(0, 100),
        riskLevel: 'low',
        suggestion: 'Specify the exact year or time period for this claim.',
        sources: ['Add specific date'],
      };
    }
  }

  // 3. Check for vague sources
  if (claim.match(/experts say|scientists believe|studies show/i)) {
    if (!claim.match(/\(.*university.*\)|\[.*\]|\..*\./)) {
      return {
        claim: claim.substring(0, 100),
        riskLevel: 'medium',
        suggestion: 'Specify which experts, scientists, or which specific studies.',
        sources: ['Name the source', 'Link to study'],
      };
    }
  }

  // 4. Check for impossible claims
  const impossiblePatterns = [
    /(\d+)%\s+(of|people|humans|world)/i,
    /all.*(always|never)/i,
    /absolutely|definitely|certainly\s+(prevents|cures|solves)/i,
  ];

  for (const pattern of impossiblePatterns) {
    if (pattern.test(claim)) {
      return {
        claim: claim.substring(0, 100),
        riskLevel: 'high',
        suggestion: 'This claim uses absolute language. Consider more nuanced wording.',
        sources: ['Soften the claim', 'Add qualifying language'],
      };
    }
  }

  // 5. Check for medical claims (if applicable)
  if (claim.match(/cure|treat|prevent|heal|disease|illness|syndrome/i)) {
    return {
      claim: claim.substring(0, 100),
      riskLevel: 'high',
      suggestion:
        'Medical claims require proper citations and disclaimers. Consider consulting healthcare professionals.',
      sources: [
        'Medical journal reference',
        'Healthcare professional review',
        'Disclaimer required',
      ],
    };
  }

  return null;
}

// Optional: Future integration with Google Fact Check API
export const checkWithGoogle = async (claim: string): Promise<any> => {
  // This would use Google Fact Check API when available
  // For now, returns pattern-based results
  return null;
};
