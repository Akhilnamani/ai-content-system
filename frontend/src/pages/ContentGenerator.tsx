import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AIModel {
  id: string;
  name: string;
  description: string;
  speed: string;
}

export const ContentGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    contentType: 'Article',
    tone: 'Professional',
    aiModel: 'mock',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    try {
      setIsLoadingModels(true);
      const response = await api.get('/content/models');
      setAvailableModels(response.data.models);
      if (response.data.models.length > 0) {
        setFormData((prev) => ({
          ...prev,
          aiModel: response.data.models[0].id,
        }));
      }
      console.log('✅ Available models:', response.data.models);
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      setAvailableModels([
        {
          id: 'mock',
          name: '🤖 Demo Mode',
          description: 'Instant generation, no API needed',
          speed: '⚡⚡⚡⚡',
        },
      ]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title.trim() || !formData.topic.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/content/generate', {
        title: formData.title,
        topic: formData.topic,
        contentType: formData.contentType,
        tone: formData.tone,
        aiModel: formData.aiModel,
      });

      console.log('✅ Content generated:', response.data);

      const modelName =
        availableModels.find((m) => m.id === response.data.aiModel)?.name ||
        response.data.aiModel;
      alert(`✅ Content generated with ${modelName}!`);
      navigate('/list');
    } catch (error: any) {
      console.error('❌ Error generating content:', error);
      alert('Failed to generate content: ' + error.response?.data?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedModel = availableModels.find((m) => m.id === formData.aiModel);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Generate Content</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., AI in Healthcare"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Topic Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="e.g., Applications of AI in medical diagnosis"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Content Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Type
            </label>
            <select
              name="contentType"
              value={formData.contentType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Article">Article</option>
              <option value="Blog Post">Blog Post</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Guide">Guide</option>
              <option value="Case Study">Case Study</option>
              <option value="Research Paper">Research Paper</option>
            </select>
          </div>

          {/* Tone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tone
            </label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Academic">Academic</option>
              <option value="Friendly">Friendly</option>
              <option value="Technical">Technical</option>
              <option value="Inspirational">Inspirational</option>
            </select>
          </div>

          {/* AI Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select AI Model
            </label>
            {isLoadingModels ? (
              <div className="text-gray-500 text-sm">Loading available models...</div>
            ) : availableModels.length > 0 ? (
              <div className="space-y-3">
                {availableModels.map((model) => (
                  <label
                    key={model.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      formData.aiModel === model.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="aiModel"
                      value={model.id}
                      checked={formData.aiModel === model.id}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-900">{model.name}</p>
                      <p className="text-sm text-gray-600">{model.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Speed: {model.speed}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-red-600 text-sm">No AI models available</div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isLoadingModels}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating with {selectedModel?.name}...
              </>
            ) : (
              `✨ Generate Content`
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={() => navigate('/list')}
            className="w-full mt-4 px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
          >
            Back to Content
          </button>
        </div>
      </main>
    </div>
  );
};
