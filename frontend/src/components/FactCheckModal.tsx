import React from 'react';

interface FlaggedClaim {
  claim: string;
  riskLevel: 'high' | 'medium' | 'low';
  suggestion: string;
  sources?: string[];
}

interface FactCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedClaims: FlaggedClaim[];
  factCheckStatus: 'verified' | 'flagged' | 'needs-review';
}

export const FactCheckModal: React.FC<FactCheckModalProps> = ({
  isOpen,
  onClose,
  flaggedClaims,
  factCheckStatus,
}) => {
  if (!isOpen) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return (
          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
            HIGH RISK
          </span>
        );
      case 'medium':
        return (
          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-orange-600 rounded">
            MEDIUM RISK
          </span>
        );
      case 'low':
        return (
          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-yellow-600 rounded">
            LOW RISK
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">🔍 Fact-Check Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Summary */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-lg font-semibold text-blue-900 mb-2">
              Status:{' '}
              <span className="uppercase">
                {factCheckStatus === 'verified' && '✅ Verified'}
                {factCheckStatus === 'flagged' && '⚠️ Flagged'}
                {factCheckStatus === 'needs-review' && '🔍 Needs Review'}
              </span>
            </p>
            <p className="text-sm text-blue-800">
              {factCheckStatus === 'verified' &&
                'This content has been analyzed and no major issues were found.'}
              {factCheckStatus === 'flagged' &&
                'This content has high-risk claims that need immediate attention.'}
              {factCheckStatus === 'needs-review' &&
                'This content has some claims that may need further verification.'}
            </p>
          </div>

          {/* Flagged Claims */}
          {flaggedClaims.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-green-600 font-semibold">✨ No Issues Found!</p>
              <p className="text-gray-600 mt-2">
                Your content passed the fact-check analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {flaggedClaims.length} Claim{flaggedClaims.length > 1 ? 's' : ''} Flagged
              </h3>

              {flaggedClaims.map((claim, index) => (
                <div key={index} className={`p-4 rounded-lg ${getRiskColor(claim.riskLevel)}`}>
                  {/* Risk Badge */}
                  <div className="mb-2">{getRiskBadge(claim.riskLevel)}</div>

                  {/* Claim Text */}
                  <p className="font-semibold text-gray-900 mb-2">📌 Claim:</p>
                  <p className="text-gray-700 mb-3 italic">"{claim.claim}"</p>

                  {/* Suggestion */}
                  <p className="font-semibold text-gray-900 mb-2">💡 Suggestion:</p>
                  <p className="text-gray-700 mb-3">{claim.suggestion}</p>

                  {/* Sources/References */}
                  {claim.sources && claim.sources.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">🔗 Recommended Actions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {claim.sources.map((source, idx) => (
                          <li key={idx} className="text-gray-700 text-sm">
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition"
            >
              Close
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
