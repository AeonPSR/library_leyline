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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Personal Library
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
          Create and organize your thoughts with interactive post-it boards. 
          Build your own knowledge base with articles, tags, and visual note-taking.
        </p>
        
        {/* Main Action Button */}
        <div className="mt-10">
          <button
            onClick={handleQuickCreate}
            disabled={isCreating}
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📄</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Articles Created
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📝</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Post-its
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🏷️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tags
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/articles"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">📄</span>
              <h3 className="text-lg font-semibold text-gray-900">View Articles</h3>
            </div>
            <p className="text-gray-600">
              Browse all your created articles and post-it boards.
            </p>
          </Link>

          <Link
            href="/tags"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-green-300"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🏷️</span>
              <h3 className="text-lg font-semibold text-gray-900">Manage Tags</h3>
            </div>
            <p className="text-gray-600">
              Create and organize tags to categorize your content.
            </p>
          </Link>

          <button
            onClick={handleQuickCreate}
            disabled={isCreating}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-purple-300 text-left w-full disabled:opacity-50"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">✨</span>
              <h3 className="text-lg font-semibold text-gray-900">Create Article</h3>
            </div>
            <p className="text-gray-600">
              Start a new post-it board to organize your thoughts.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
