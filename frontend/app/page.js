'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:5000/api/articles/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const article = await response.json();
        router.push(`/articles/${article._id}`);
      } else {
        throw new Error('Failed to create article');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Failed to create article. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-100 sm:text-5xl md:text-6xl tracking-wide">
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Personal Library
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
            Create and organize your thoughts with interactive post-it boards. 
            Build your own knowledge base with articles, tags, and visual note-taking.
          </p>
          
          {/* Main Action Button */}
          <div className="mt-10">
            <button
              onClick={handleQuickCreate}
              disabled={isCreating}
              className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all duration-200 shadow-xl shadow-purple-900/25 hover:shadow-2xl hover:shadow-purple-800/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <svg
                className="mr-2 -ml-1 w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {isCreating ? 'Creating...' : 'Create New Article'}
            </button>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm overflow-hidden shadow-xl rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl text-white font-semibold">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Articles Created
                  </dt>
                  <dd className="text-lg font-medium text-gray-100">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm overflow-hidden shadow-xl rounded-lg border border-gray-700 hover:border-amber-500 transition-all duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl text-white font-semibold">N</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Post-its
                  </dt>
                  <dd className="text-lg font-medium text-gray-100">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm overflow-hidden shadow-xl rounded-lg border border-gray-700 hover:border-emerald-500 transition-all duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl text-white font-semibold">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Tags
                  </dt>
                  <dd className="text-lg font-medium text-gray-100">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-100 mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/articles"
            className="block p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-700 hover:border-purple-500 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-lg text-white font-semibold">A</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-purple-300 transition-colors">View Articles</h3>
            </div>
            <p className="text-gray-300">
              Browse all your created articles and post-it boards.
            </p>
          </Link>

          <Link
            href="/tags"
            className="block p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-700 hover:border-emerald-500 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-lg text-white font-semibold">T</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-emerald-300 transition-colors">Manage Tags</h3>
            </div>
            <p className="text-gray-300">
              Organize your content with custom tags and categories.
            </p>
          </Link>

          <button
            onClick={handleQuickCreate}
            disabled={isCreating}
            className="block p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-700 hover:border-purple-500 text-left w-full disabled:opacity-50 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-lg text-white font-semibold">+</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-purple-300 transition-colors">Create Article</h3>
            </div>
            <p className="text-gray-300">
              Start a new post-it board to organize your thoughts.
            </p>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
