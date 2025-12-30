import React from 'react';

interface QualityBadgeProps {
  score: number;
  halluccinationRisk: 'high' | 'medium' | 'low' | 'none';
  flaggedClaimsCount?: number;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  score,
  halluccinationRisk,
  flaggedClaimsCount = 0,
}) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Determine risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'none':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get risk emoji
  const getRiskEmoji = (risk: string) => {
    switch (risk) {
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return '✓';
      case 'none':
        return '✅';
      default:
        return '?';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Quality Score Badge */}
      <div
        className={`px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(
          score
        )}`}
      >
        📊 Quality: {score}/100
      </div>

      {/* Hallucination Risk Badge */}
      <div
        className={`px-3 py-1 rounded-full border text-sm font-semibold ${getRiskColor(
          halluccinationRisk
        )}`}
      >
        {getRiskEmoji(halluccinationRisk)} {halluccinationRisk.charAt(0).toUpperCase() + halluccinationRisk.slice(1)} Risk
      </div>

      {/* Flagged Claims Badge */}
      {flaggedClaimsCount > 0 && (
        <div className="px-3 py-1 rounded-full border text-sm font-semibold bg-red-100 text-red-800 border-red-300">
          🚩 {flaggedClaimsCount} Flagged Claim{flaggedClaimsCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Verified Badge */}
      {flaggedClaimsCount === 0 && halluccinationRisk === 'none' && (
        <div className="px-3 py-1 rounded-full border text-sm font-semibold bg-green-100 text-green-800 border-green-300">
          ✨ Verified Content
        </div>
      )}
    </div>
  );
};
