import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface Content {
  _id: string;
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  qualityScore?: number;
  createdAt: string;
  status?: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWords: 0,
    avgQuality: 0,
    topTone: 'Professional',
    topType: 'Article',
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/content/list');
      const allContents = response.data.contents || [];
      setContents(allContents);
      console.log('✅ Contents fetched:', allContents.length);

      // Calculate stats
      if (allContents.length > 0) {
        const totalWords = allContents.reduce((sum: number, c: any) => sum + (c.content?.split(' ').length || 0), 0);
        const avgQuality = (allContents.reduce((sum: number, c: any) => sum + (c.qualityScore || 0), 0) / allContents.length).toFixed(1);
        
        // Get most common tone
        const tones = allContents.map((c: any) => c.tone);
        const topTone = tones.sort((a: string, b: string) => 
          tones.filter(x => x === a).length - tones.filter(x => x === b).length
        ).pop() || 'Professional';

        // Get most common type
        const types = allContents.map((c: any) => c.contentType);
        const topType = types.sort((a: string, b: string) => 
          types.filter(x => x === a).length - types.filter(x => x === b).length
        ).pop() || 'Article';

        setStats({
          totalWords,
          avgQuality: parseFloat(avgQuality as string),
          topTone,
          topType,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGenerateClick = () => {
    navigate('/generate');
  };

  const handleViewContent = () => {
    navigate('/content-list');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Content System</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.firstName}! 👋</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Generate Content Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">🚀 Generate Content</h2>
                <p className="text-blue-100 text-sm">Create AI-powered content variants</p>
              </div>
              <div className="text-4xl">✨</div>
            </div>
            <button
              onClick={handleGenerateClick}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition mt-4 w-full"
            >
              Get Started
            </button>
          </div>

          {/* Your Content Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">📚 Your Content</h2>
                <p className="text-purple-100 text-sm">View all generated content</p>
              </div>
              <div className="text-4xl">📖</div>
            </div>
            <button
              onClick={handleViewContent}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition mt-4 w-full"
            >
              View All
            </button>
          </div>

          {/* Analytics Card */}
          <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">📊 Analytics</h2>
                <p className="text-pink-100 text-sm">View your content performance</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-white text-pink-600 px-6 py-2 rounded-lg font-semibold hover:bg-pink-50 transition mt-4 w-full"
            >
              View Stats
            </button>
          </div>
        </div>

        {/* Stats Grid - UPDATED WITH REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Content</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{contents.length}</p>
                <p className="text-xs text-gray-500 mt-2">📄 pieces created</p>
              </div>
              <div className="text-5xl opacity-10">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Quality</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.avgQuality.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-2">⭐ out of 100</p>
              </div>
              <div className="text-5xl opacity-10">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Words</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{(stats.totalWords / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-500 mt-2">💬 words generated</p>
              </div>
              <div className="text-5xl opacity-10">💬</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Top Content Type</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.topType}</p>
                <p className="text-xs text-gray-500 mt-2">🎯 most created</p>
              </div>
              <div className="text-5xl opacity-10">📊</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-lg transition">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Content Generation</h3>
              <p className="text-gray-600 text-sm">Generate high-quality content with multiple AI models and tones</p>
              <div className="mt-4 text-xs text-blue-600 font-semibold">✓ 8 Tone Options ✓ Multiple Models</div>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-lg transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Analysis</h3>
              <p className="text-gray-600 text-sm">Automatic quality scoring and hallucination detection</p>
              <div className="mt-4 text-xs text-green-600 font-semibold">✓ Quality Metrics ✓ Risk Detection</div>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-lg transition">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PDF Export & Share</h3>
              <p className="text-gray-600 text-sm">Download reports as PDF and share with public links</p>
              <div className="mt-4 text-xs text-purple-600 font-semibold">✓ PDF Reports ✓ Public Links</div>
            </div>
          </div>
        </div>

        {/* Recent Content Preview */}
        {contents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📝 Recent Content</h2>
              <button
                onClick={handleViewContent}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contents.slice(0, 4).map((content) => (
                <div key={content._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{content.title}</h3>
                      <p className="text-sm text-gray-600">{content.topic}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      {content.contentType}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {content.qualityScore && (
                        <>
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-semibold text-gray-700">{content.qualityScore}/100</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {contents.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Content Yet</h3>
            <p className="text-gray-600 mb-6">Get started by generating your first piece of content</p>
            <button
              onClick={handleGenerateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-block"
            >
              Create Your First Content
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
