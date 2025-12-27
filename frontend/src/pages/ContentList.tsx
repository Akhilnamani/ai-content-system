import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Content {
  _id: string;
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  content: string;
  createdAt: string;
}

export const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
          <button
            onClick={() => navigate('/generate')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Generate New
          </button>
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

                <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                  {content.content}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(content.createdAt).toLocaleDateString()}</span>
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
            ))
          )}
        </div>
      </main>

      {/* Modal for full content view */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h2>
                <p className="text-gray-600 mt-2">{selectedContent.topic}</p>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {selectedContent.contentType}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                {selectedContent.tone}
              </span>
            </div>

            <div className="prose max-w-none mb-6">
              <div className="text-gray-700 whitespace-pre-wrap">
                {selectedContent.content}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedContent.content);
                  alert('Content copied to clipboard!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setSelectedContent(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
