'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function ArticleBoardPage() {
  const params = useParams();
  const articleId = params.id;
  
  const [article, setArticle] = useState(null);
  const [postits, setPostits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [draggedPostit, setDraggedPostit] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingPostit, setEditingPostit] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
  const [tagToRemove, setTagToRemove] = useState(null);
  const boardRef = useRef(null);

  useEffect(() => {
    if (articleId) {
      fetchArticleAndPostits();
      fetchAvailableTags();
    }
  }, [articleId]);

  const fetchArticleAndPostits = async () => {
    try {
      // Fetch article details
      const articleResponse = await fetch(`http://localhost:5000/api/articles/${articleId}`);
      if (!articleResponse.ok) {
        throw new Error('Article not found');
      }
      const articleData = await articleResponse.json();
      setArticle(articleData);
      setNewTitle(articleData.title);

      // Fetch post-its for this article
      const postitsResponse = await fetch(`http://localhost:5000/api/articles/${articleId}/postits`);
      if (postitsResponse.ok) {
        const postitsData = await postitsResponse.json();
        setPostits(postitsData.postits || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tags');
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const updateTitle = async () => {
    if (newTitle.trim() === article.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (response.ok) {
        setArticle({ ...article, title: newTitle.trim() });
        setIsEditingTitle(false);
      } else {
        throw new Error('Failed to update title');
      }
    } catch (err) {
      setError(err.message);
      setNewTitle(article.title); // Reset to original
    }
  };

  const createPostit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/postits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'New note...',
          articleId: articleId,
          position: {
            x: Math.random() * 400 + 50, // Random position
            y: Math.random() * 300 + 50,
            width: 200,
            height: 150,
            zIndex: 1
          },
          color: '#FBBF24' // Yellow
        }),
      });

      if (response.ok) {
        fetchArticleAndPostits(); // Refresh
      } else {
        throw new Error('Failed to create post-it');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePostitContent = async (postitId, newContent) => {
    try {
      const response = await fetch(`http://localhost:5000/api/postits/${postitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        fetchArticleAndPostits(); // Refresh
        setEditingPostit(null);
      } else {
        throw new Error('Failed to update post-it');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePostit = async (postitId) => {
    if (!confirm('Are you sure you want to delete this post-it?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/postits/${postitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchArticleAndPostits(); // Refresh
      } else {
        throw new Error('Failed to delete post-it');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePostitPosition = async (postitId, newPosition) => {
    try {
      const response = await fetch(`http://localhost:5000/api/postits/${postitId}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: newPosition }),
      });

      if (!response.ok) {
        throw new Error('Failed to update position');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Drag handling
  const handleDragStart = (e, postit) => {
    setDraggedPostit(postit);
    const rect = e.currentTarget.getBoundingClientRect();
    const boardRect = boardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragMove = (e) => {
    if (!draggedPostit || !boardRef.current) return;
    
    e.preventDefault();
    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - boardRect.left - dragOffset.x;
    const newY = e.clientY - boardRect.top - dragOffset.y;

    // Update the postit position in state for immediate feedback
    setPostits(prevPostits => 
      prevPostits.map(p => 
        p._id === draggedPostit._id 
          ? { ...p, position: { ...p.position, x: Math.max(0, newX), y: Math.max(0, newY) } }
          : p
      )
    );
  };

  const handleDragEnd = (e) => {
    if (!draggedPostit || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - boardRect.left - dragOffset.x);
    const newY = Math.max(0, e.clientY - boardRect.top - dragOffset.y);

    const newPosition = {
      ...draggedPostit.position,
      x: newX,
      y: newY
    };

    // Update position in backend
    updatePostitPosition(draggedPostit._id, newPosition);
    
    setDraggedPostit(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (draggedPostit) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
    }, [draggedPostit, dragOffset]);

  const addTagToArticle = async (tagName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: [tagName] }),
      });

      if (response.ok) {
        fetchArticleAndPostits(); // Refresh to get updated tags
      } else {
        throw new Error('Failed to add tag');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmRemoveTag = (tagName) => {
    setTagToRemove(tagName);
  };

  const removeTagFromArticle = async (tagName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: [tagName] }),
      });

      if (response.ok) {
        fetchArticleAndPostits(); // Refresh to get updated tags
        setTagToRemove(null); // Close confirmation dialog
      } else {
        throw new Error('Failed to remove tag');
      }
    } catch (err) {
      setError(err.message);
      setTagToRemove(null);
    }
  };

  const createNewTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTag),
      });

      if (response.ok) {
        const createdTag = await response.json();
        
        // Refresh available tags
        await fetchAvailableTags();
        
        // Automatically add the new tag to the current article
        await addTagToArticle(createdTag.name);
        
        // Reset form and close create form
        setNewTag({ name: '', color: '#3B82F6' });
        setShowCreateTag(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }
    } catch (err) {
      setError(err.message);
    }
  };  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                onBlur={updateTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateTitle();
                  if (e.key === 'Escape') {
                    setNewTitle(article.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <h1 
              className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit title"
            >
              {article.title}
            </h1>
          )}
          <p className="text-gray-600 mt-1">
            {postits.length} post-it{postits.length !== 1 ? 's' : ''} • 
            Last updated {new Date(article.updatedAt).toLocaleDateString()}
          </p>

          {/* Tags Display */}
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              {article.tags && article.tags.length > 0 ? (
                <>
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full group"
                    >
                      {tag}
                      <button
                        onClick={() => confirmRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-gray-400 text-sm">No tags</span>
              )}
              <button
                onClick={() => setShowTagManager(true)}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50"
                title="Manage tags"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Tag
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={createPostit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 shadow-lg"
          >
            <svg
              className="mr-2 -ml-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Post-it
          </button>
        </div>
      </div>

      {/* Tag Manager Modal */}
      {showTagManager && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowTagManager(false);
            setShowCreateTag(false);
            setNewTag({ name: '', color: '#3B82F6' });
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Manage Tags</h3>
              <button
                onClick={() => setShowCreateTag(true)}
                className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100"
              >
                + New Tag
              </button>
            </div>
            
            {/* Create Tag Form */}
            {showCreateTag && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-black mb-3">Create New Tag</h4>
                <form onSubmit={createNewTag} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Tag name *"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-black">Color:</label>
                    <input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                      className="w-8 h-8 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Create & Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateTag(false);
                        setNewTag({ name: '', color: '#3B82F6' });
                      }}
                      className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Tags List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => {
                  const isSelected = article.tags && article.tags.includes(tag.name);
                  return (
                    <div
                      key={tag._id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span className="text-sm text-black">{tag.name}</span>
                      </div>
                      <button
                        onClick={() => 
                          isSelected 
                            ? confirmRemoveTag(tag.name)
                            : addTagToArticle(tag.name)
                        }
                        className={`px-2 py-1 text-xs rounded ${
                          isSelected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-black text-sm mb-3">
                    No tags available yet.
                  </p>
                  <button
                    onClick={() => setShowCreateTag(true)}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create Your First Tag
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowTagManager(false);
                  setShowCreateTag(false);
                  setNewTag({ name: '', color: '#3B82F6' });
                }}
                className="px-4 py-2 text-sm text-black bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Removal Confirmation Dialog */}
      {tagToRemove && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setTagToRemove(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-black mb-4">Remove Tag</h3>
            <p className="text-black mb-6">
              Are you sure you want to remove the tag "<span className="font-semibold">{tagToRemove}</span>" from this article?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTagToRemove(null)}
                className="px-4 py-2 text-sm text-black bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => removeTagFromArticle(tagToRemove)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Area */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-[600px] relative overflow-hidden select-none">
        {postits.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-4xl text-gray-400">N</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Empty Board</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first post-it note.
              </p>
              <button
                onClick={createPostit}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
              >
                Add Your First Post-it
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 h-full" ref={boardRef}>
            {postits.map((postit) => (
              <div
                key={postit._id}
                className="absolute shadow-lg rounded-lg border border-gray-300 group"
                style={{
                  left: `${postit.position.x}px`,
                  top: `${postit.position.y}px`,
                  width: `${postit.position.width}px`,
                  height: `${postit.position.height}px`,
                  backgroundColor: postit.color,
                  zIndex: postit.position.zIndex,
                }}
              >
                {/* Drag Handle */}
                <div
                  className="absolute -top-3 -left-3 w-6 h-6 bg-gray-600 rounded-full cursor-move opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onMouseDown={(e) => handleDragStart(e, postit)}
                  title="Drag to move"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </div>

                {/* Delete Button */}
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                  onClick={() => deletePostit(postit._id)}
                  title="Delete post-it"
                >
                  ×
                </button>

                <div className="p-3 h-full flex flex-col">
                  {editingPostit === postit._id ? (
                    <textarea
                      className="flex-1 text-sm text-gray-800 bg-transparent border-none outline-none resize-none"
                      defaultValue={postit.content}
                      onBlur={(e) => updatePostitContent(postit._id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          updatePostitContent(postit._id, e.target.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingPostit(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="flex-1 text-sm text-gray-800 whitespace-pre-wrap overflow-hidden cursor-text"
                      onClick={() => setEditingPostit(postit._id)}
                      title="Click to edit"
                    >
                      {postit.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Info */}
      {article.summary && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{article.summary}</p>
        </div>
      )}
    </div>
  );
}