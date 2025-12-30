import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QualityBadge } from '../components/QualityBadge';
import { QualityDetails } from '../components/QualityDetails';

interface FlaggedClaim {
  claim: string;
  riskLevel: 'high' | 'medium' | 'low';
  suggestion: string;
  sources?: string[];
}

interface QualityDetailsType {
  wordCount: number;
  sentenceCount: number;
  readabilityScore: number;
  structureScore: number;
  uniqueWordsRatio: number;
}

interface Content {
  _id: string;
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  content: string;
  createdAt: string;
  aiModel?: string;
  qualityScore?: number;
  halluccinationRisk?: 'high' | 'medium' | 'low' | 'none';
  flaggedClaims?: FlaggedClaim[];
  factCheckStatus?: 'verified' | 'flagged' | 'needs-review';
  qualityDetails?: QualityDetailsType;
}

export const EditContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/content/${id}`);
      console.log('✅ Content fetched:', response.data);
      const fetchedContent = response.data.content;
      setContent(fetchedContent);
      setEditedTitle(fetchedContent.title);
      setEditedContent(fetchedContent.content);
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      alert('Failed to fetch content');
      navigate('/content-list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      alert('Title and content cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.put(`/content/${id}`, {
        title: editedTitle,
        content: editedContent,
      });
      console.log('✅ Content updated:', response.data);
      alert('Content updated successfully!');
      navigate('/content-list');
    } catch (error) {
      console.error('❌ Error updating content:', error);
      alert('Failed to update content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Content not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
          <button
            onClick={() => navigate('/content-list')}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Quality Badge Section */}
          {content.qualityScore !== undefined && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">🎯 Content Quality Analysis</h2>
              <QualityBadge
                score={content.qualityScore}
                halluccinationRisk={content.halluccinationRisk || 'none'}
                flaggedClaimsCount={content.flaggedClaims?.length || 0}
              />

              {/* Fact-Check Status */}
              {content.factCheckStatus && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900">
                    Fact-Check Status:{' '}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${
                        content.factCheckStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : content.factCheckStatus === 'flagged'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {content.factCheckStatus === 'verified' && '✅ Verified'}
                      {content.factCheckStatus === 'flagged' && '⚠️ Flagged'}
                      {content.factCheckStatus === 'needs-review' && '🔍 Needs Review'}
                    </span>
                  </p>
                  {content.flaggedClaims && content.flaggedClaims.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      {content.flaggedClaims.length} claim(s) need verification
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quality Details Component */}
          {content.qualityDetails && (
            <QualityDetails details={content.qualityDetails} />
          )}

          {/* Title */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Content Info */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div>
              <p className="text-gray-600 text-sm">Topic</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{content.topic}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{content.contentType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tone</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{content.tone}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Created</p>
              <p className="font-semibold text-gray-900 text-sm">
                {new Date(content.createdAt).toLocaleDateString()}
              </p>
            </div>
            {content.aiModel && (
              <div>
                <p className="text-gray-600 text-sm">AI Model</p>
                <p className="font-semibold text-gray-900 text-sm truncate">🤖 {content.aiModel}</p>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
          </div>

          {/* Word Count & Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-600 text-sm mb-1">Word Count</p>
              <p className="text-2xl font-bold text-blue-600">
                {editedContent.split(/\s+/).filter(word => word).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-gray-600 text-sm mb-1">Characters</p>
              <p className="text-2xl font-bold text-purple-600">{editedContent.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-600 text-sm mb-1">Sentences</p>
              <p className="text-2xl font-bold text-green-600">
                {editedContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
              </p>
            </div>
          </div>

          {/* Warning for Quality Changes */}
          {content.qualityScore !== undefined && (
            <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">💡 Note:</span> Changes you make to the content won't automatically update the quality score. 
                The quality metrics above reflect the original generated content.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
            >
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button
              onClick={() => navigate('/content-list')}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
