import React from 'react';

interface QualityDetailsType {
  wordCount: number;
  sentenceCount: number;
  readabilityScore: number;
  structureScore: number;
  uniqueWordsRatio: number;
}

interface QualityDetailsProps {
  details: QualityDetailsType;
}

export const QualityDetails: React.FC<QualityDetailsProps> = ({ details }) => {
  const getScoreColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className={`text-sm font-semibold ${getScoreColor(value, max)}`}>
            {Math.round(value)} / {max}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor(value, max)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Content Quality Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Word Count */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Word Count</p>
          <p className="text-2xl font-bold text-blue-600">{details.wordCount}</p>
        </div>

        {/* Sentence Count */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Sentence Count</p>
          <p className="text-2xl font-bold text-purple-600">{details.sentenceCount}</p>
        </div>

        {/* Readability Score */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Readability Grade</p>
          <p className="text-2xl font-bold text-green-600">{details.readabilityScore.toFixed(1)}</p>
        </div>

        {/* Unique Words Ratio */}
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600">Unique Words Ratio</p>
          <p className="text-2xl font-bold text-orange-600">
            {details.uniqueWordsRatio.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Score Breakdown</h4>
        <ProgressBar value={details.readabilityScore} max={18} label="Readability Score" />
        <ProgressBar value={details.structureScore} max={100} label="Structure Score" />
        <ProgressBar
          value={details.uniqueWordsRatio}
          max={100}
          label="Unique Words Ratio"
        />
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs font-semibold text-yellow-900 mb-1">💡 Quality Tips:</p>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>
            • Word count: Aim for {details.wordCount < 300 ? '300+' : 'balance'}
          </li>
          <li>• Readability: Grade {details.readabilityScore.toFixed(0)} is{'  '}
            {details.readabilityScore < 10
              ? 'good for technical content'
              : 'good for general audience'}
          </li>
          <li>
            • Unique words: {details.uniqueWordsRatio > 50 ? 'Great diversity' : 'Increase variety'}
          </li>
        </ul>
      </div>
    </div>
  );
};
