import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface Content {
  _id: string;
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  content: string;
  createdAt: string;
}

interface AnalyticsData {
  totalContent: number;
  totalWords: number;
  averageWords: number;
  contentByType: { name: string; value: number }[];
  contentByTone: { name: string; value: number }[];
  activityData: { date: string; count: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/content/list');
      const contentsList: Content[] = response.data.contents || [];
      setContents(contentsList);

      // Calculate analytics
      const totalContent = contentsList.length;
      const totalWords = contentsList.reduce((sum, c) => sum + c.content.split(/\s+/).length, 0);
      const averageWords = totalContent > 0 ? Math.round(totalWords / totalContent) : 0;

      // Content by type
      const typeMap = new Map<string, number>();
      contentsList.forEach((c) => {
        typeMap.set(c.contentType, (typeMap.get(c.contentType) || 0) + 1);
      });
      const contentByType = Array.from(typeMap).map(([name, value]) => ({ name, value }));

      // Content by tone
      const toneMap = new Map<string, number>();
      contentsList.forEach((c) => {
        toneMap.set(c.tone, (toneMap.get(c.tone) || 0) + 1);
      });
      const contentByTone = Array.from(toneMap).map(([name, value]) => ({ name, value }));

      // Activity data (last 7 days)
      const activityMap = new Map<string, number>();
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        activityMap.set(dateStr, 0);
      }

      contentsList.forEach((c) => {
        const contentDate = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (activityMap.has(contentDate)) {
          activityMap.set(contentDate, (activityMap.get(contentDate) || 0) + 1);
        }
      });
      const activityData = Array.from(activityMap).map(([date, count]) => ({ date, count }));

      setAnalytics({
        totalContent,
        totalWords,
        averageWords,
        contentByType,
        contentByTone,
        activityData,
      });

      console.log('✅ Analytics calculated');
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      alert('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/list')}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
            >
              Back to Content
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Content</p>
            <p className="text-4xl font-bold text-blue-600">{analytics.totalContent}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Words</p>
            <p className="text-4xl font-bold text-green-600">{analytics.totalWords.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Average Words</p>
            <p className="text-4xl font-bold text-purple-600">{analytics.averageWords}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Content Types</p>
            <p className="text-4xl font-bold text-orange-600">{analytics.contentByType.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content by Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content by Type</h2>
            {analytics.contentByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.contentByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.contentByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* Content by Tone */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content by Tone</h2>
            {analytics.contentByTone.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.contentByTone}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Generation Activity (Last 7 Days)</h2>
          {analytics.activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Content Generated" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No activity data available</p>
          )}
        </div>

        {/* Recent Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Content</h2>
          {contents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Words</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.slice(0, 5).map((content) => (
                    <tr key={content._id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium truncate">{content.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {content.contentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{content.tone}</td>
                      <td className="px-4 py-3 text-gray-600">{content.content.split(/\s+/).length}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(content.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No content generated yet</p>
          )}
        </div>
      </main>
    </div>
  );
};
