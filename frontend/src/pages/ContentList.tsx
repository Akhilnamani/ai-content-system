import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QualityBadge } from '../components/QualityBadge';
import { FactCheckModal } from '../components/FactCheckModal';
import { exportQualityReportPDF } from '../services/qualityReportPDF';
import { RegenerateModal } from '../components/RegenerateModal';

interface FlaggedClaim {
  claim: string;
  riskLevel: 'high' | 'medium' | 'low';
  suggestion: string;
  sources?: string[];
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
  qualityDetails?: {
    wordCount: number;
    sentenceCount: number;
    readabilityScore: number;
    structureScore: number;
    uniqueWordsRatio: number;
  };
}

export const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFactCheck, setShowFactCheck] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/content/list');
      console.log('✅ Contents fetched:', response.data);
      setContents(response.data.contents || []);
    } catch (error) {
      console.error('❌ Error fetching contents:', error);
      alert('Failed to fetch contents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await api.delete(`/content/${id}`);
      console.log('✅ Content deleted');
      setContents(contents.filter((c) => c._id !== id));
      setSelectedContent(null);
      alert('Content deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const exportToPDF = async (content: Content) => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Create a hidden div for rendering
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.width = '800px';

      element.innerHTML = `
        <h1 style="font-size: 28px; margin-bottom: 10px;">${content.title}</h1>
        <p style="color: #666; margin-bottom: 20px;"><strong>Topic:</strong> ${content.topic} | <strong>Type:</strong> ${content.contentType} | <strong>Tone:</strong> ${content.tone}</p>
        ${
          content.qualityScore !== undefined
            ? `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-weight: bold;">📊 Quality Score: ${content.qualityScore}/100</p>
          <p style="margin: 5px 0 0 0; color: #1e40af; font-size: 12px;">Risk Level: ${content.halluccinationRisk || 'none'}</p>
          ${
            content.factCheckStatus
              ? `<p style="margin: 5px 0 0 0; color: #1e40af; font-size: 12px;">Fact-Check Status: ${content.factCheckStatus}</p>`
              : ''
          }
        </div>
        `
            : ''
        }
        <hr style="margin: 20px 0;">
        <div style="font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;">${content.content}</div>
        <hr style="margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Generated: ${new Date(content.createdAt).toLocaleString()} | AI Model: ${content.aiModel || 'unknown'}</p>
      `;

      document.body.appendChild(element);

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210 - 20; // A4 width - margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 297 - 20; // A4 height - margins

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${content.title}.pdf`);
      alert('PDF exported successfully!');
      console.log('✅ PDF exported:', content.title);
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      const element = document.querySelector('div[style*="left: -9999px"]');
      if (element) {
        document.body.removeChild(element);
      }
    }
  };

  const filteredContents = contents.filter((content) =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Content</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              📊 Analytics
            </button>
            <button
              onClick={() => navigate('/generate')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Generate New
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {searchTerm ? 'No content found matching your search' : 'No content generated yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/generate')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Generate Your First Content
                </button>
              )}
            </div>
          ) : (
            filteredContents.map((content) => (
              <div
                key={content._id}
                onClick={() => setSelectedContent(content)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{content.topic}</p>
                  </div>
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                    {content.contentType}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Tone: <span className="font-semibold">{content.tone}</span>
                </p>

                {/* Quality Badge on Card */}
                {content.qualityScore !== undefined && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        content.qualityScore >= 80
                          ? 'bg-green-100 text-green-800'
                          : content.qualityScore >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      📊 {content.qualityScore}/100
                    </span>
                    {content.halluccinationRisk && (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          content.halluccinationRisk === 'high'
                            ? 'bg-red-100 text-red-800'
                            : content.halluccinationRisk === 'medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {content.halluccinationRisk === 'high' && '⚠️'}
                        {content.halluccinationRisk === 'medium' && '⚡'}
                        {content.halluccinationRisk === 'low' && '✓'}
                        {content.halluccinationRisk === 'none' && '✅'} Risk
                      </span>
                    )}
                  </div>
                )}

                <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                  {content.content}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit/${content._id}`);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(content._id);
                      }}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal for full content view */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h2>
                <p className="text-gray-600 mt-2">{selectedContent.topic}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedContent(null);
                  setShowFactCheck(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {selectedContent.contentType}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                {selectedContent.tone}
              </span>
              {selectedContent.aiModel && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  🤖 {selectedContent.aiModel}
                </span>
              )}
            </div>

            {/* Quality Badge in Modal */}
            {selectedContent.qualityScore !== undefined && (
              <div className="mb-6">
                <QualityBadge
                  score={selectedContent.qualityScore}
                  halluccinationRisk={selectedContent.halluccinationRisk || 'none'}
                  flaggedClaimsCount={selectedContent.flaggedClaims?.length || 0}
                />
              </div>
            )}

            {/* Fact-Check Button */}
            {selectedContent.flaggedClaims && selectedContent.flaggedClaims.length > 0 && (
              <button
                onClick={() => setShowFactCheck(true)}
                className="w-full mb-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                🔍 View Fact-Check Details ({selectedContent.flaggedClaims.length} claims)
              </button>
            )}

            {/* Quality Details Section */}
            {selectedContent.qualityDetails && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">📊 Quality Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Word Count</p>
                    <p className="text-lg font-bold text-blue-600">{selectedContent.qualityDetails.wordCount}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Readability</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedContent.qualityDetails.readabilityScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Structure</p>
                    <p className="text-lg font-bold text-purple-600">
                      {selectedContent.qualityDetails.structureScore}/100
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Unique Words</p>
                    <p className="text-lg font-bold text-orange-600">
                      {selectedContent.qualityDetails.uniqueWordsRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="prose max-w-none mb-6">
              <div className="text-gray-700 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                {selectedContent.content}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedContent.content);
                  alert('Content copied to clipboard!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                📋 Copy to Clipboard
              </button>
              <button
  onClick={() => {
    if (selectedContent) exportQualityReportPDF(selectedContent);
  }}
  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-semibold"
>
  📊 Quality Report
</button>
              <button
                onClick={() => {
                  exportToPDF(selectedContent);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
              >
                📄 Export as PDF
              </button>
              <button
  onClick={() => setShowRegenerate(true)}
  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
>
  🔄 Regenerate
</button>

              <button
                onClick={() => {
                  navigate(`/edit/${selectedContent._id}`);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  setSelectedContent(null);
                  setShowFactCheck(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fact-Check Modal */}
      <FactCheckModal
        isOpen={showFactCheck}
        onClose={() => setShowFactCheck(false)}
        flaggedClaims={selectedContent?.flaggedClaims || []}
        factCheckStatus={selectedContent?.factCheckStatus || 'verified'}
      />
      <RegenerateModal
  isOpen={showRegenerate}
  onClose={() => setShowRegenerate(false)}
  contentId={selectedContent?._id || ''}
  currentTone={selectedContent?.tone || ''}
  onRegenerate={() => {
    setShowRegenerate(false);
    fetchContents();
  }}
/>
    </div>
  );
};
