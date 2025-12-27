import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <p className="text-gray-600 text-sm">Topic</p>
              <p className="font-semibold text-gray-900">{content.topic}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="font-semibold text-gray-900">{content.contentType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tone</p>
              <p className="font-semibold text-gray-900">{content.tone}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Created</p>
              <p className="font-semibold text-gray-900">
                {new Date(content.createdAt).toLocaleDateString()}
              </p>
            </div>
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

          {/* Word Count */}
          <div className="mb-8 flex justify-between items-center">
            <p className="text-gray-600">
              Word count: <span className="font-semibold">{editedContent.split(/\s+/).filter(word => word).length}</span>
            </p>
            <p className="text-gray-600">
              Characters: <span className="font-semibold">{editedContent.length}</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
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
