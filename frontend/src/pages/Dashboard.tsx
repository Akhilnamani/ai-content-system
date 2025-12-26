import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ContentAI Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName}!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold">Generate Content</h3>
              <p className="text-sm mt-2 opacity-90">Create AI-powered content variants</p>
              <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition">
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold">Search Content</h3>
              <p className="text-sm mt-2 opacity-90">Find existing content with semantic search</p>
              <button className="mt-4 bg-white text-purple-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition">
                Explore
              </button>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold">Analytics</h3>
              <p className="text-sm mt-2 opacity-90">View your content performance</p>
              <button className="mt-4 bg-white text-pink-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition">
                View Stats
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Total Content</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Published</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">In Review</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
