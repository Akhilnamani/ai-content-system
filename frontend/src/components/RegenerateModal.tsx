import React, { useState } from 'react';
import api from '../services/api';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  currentTone: string;
  onRegenerate: () => void;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  isOpen,
  onClose,
  contentId,
  currentTone,
  onRegenerate,
}) => {
  const [selectedTone, setSelectedTone] = useState(currentTone);
  const [focusArea, setFocusArea] = useState('quality');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toneOptions = ['formal', 'casual', 'technical', 'creative', 'friendly', 'professional', 'analytical', 'persuasive'];

  const focusAreas = [
    { id: 'quality', label: 'Focus on Quality', description: 'Improve readability and structure', emoji: '⭐' },
    { id: 'clarity', label: 'Focus on Clarity', description: 'Make content more concise and clear', emoji: '🎯' },
    { id: 'engagement', label: 'Focus on Engagement', description: 'Add more engaging elements', emoji: '💫' },
    { id: 'seo', label: 'Focus on SEO', description: 'Optimize for search engines', emoji: '🔍' },
  ];

  const handleRegenerate = async () => {
    if (selectedTone === currentTone && focusArea === 'quality') {
      alert('Please select a different tone or focus area');
      return;
    }

    try {
      setIsRegenerating(true);
      const response = await api.post(`/content/${contentId}/regenerate`, {
        newTone: selectedTone,
        focusArea,
      });

      console.log('✅ Content regenerated:', response.data);
      alert('Content regenerated successfully!');
      onRegenerate();
      onClose();
    } catch (error) {
      console.error('❌ Error regenerating content:', error);
      alert('Failed to regenerate content');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔄 Regenerate Content</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <p className="text-gray-600 mb-6">Regenerate your content with a different tone or focus area to improve quality.</p>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Tone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {toneOptions.map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`p-3 rounded-lg border-2 transition font-semibold text-sm capitalize ${
                  selectedTone === tone
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Focus Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {focusAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => setFocusArea(area.id)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  focusArea === area.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{area.emoji}</span>
                  <div>
                    <p className={`font-semibold ${focusArea === area.id ? 'text-blue-900' : 'text-gray-900'}`}>
                      {area.label}
                    </p>
                    <p className="text-sm text-gray-600">{area.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || selectedTone === currentTone}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isRegenerating ? 'Regenerating...' : '🚀 Regenerate Now'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
