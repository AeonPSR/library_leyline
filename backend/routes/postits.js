const express = require('express');
const PostIt = require('../models/PostIt');
const router = express.Router();

// GET /api/postits - Get all post-its with optional filtering
router.get('/', async (req, res) => {
  try {
    const { page, limit, articleId } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      articleId: articleId || undefined
    };

    const result = await PostIt.findAll(options);
    res.json(result);
  } catch (error) {
    console.error('Error fetching post-its:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/postits/:id - Get post-it by ID
router.get('/:id', async (req, res) => {
  try {
    const postIt = await PostIt.findById(req.params.id);
    
    if (!postIt) {
      return res.status(404).json({ error: 'Post-it not found' });
    }
    
    res.json(postIt);
  } catch (error) {
    console.error('Error fetching post-it:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid post-it ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/postits - Create new post-it
router.post('/', async (req, res) => {
  try {
    const { content, articleId, position, color } = req.body;
    
    // Basic validation
    if (!content || !articleId) {
      return res.status(400).json({ error: 'Content and articleId are required' });
    }

    const postItData = {
      content: content.trim(),
      articleId,
      position: position || {},
      color: color || '#FBBF24'
    };

    const postIt = await PostIt.create(postItData);
    res.status(201).json(postIt);
  } catch (error) {
    console.error('Error creating post-it:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/postits/:id - Update post-it
router.put('/:id', async (req, res) => {
  try {
    const { content, position, color } = req.body;
    
    const updateData = {};
    if (content) updateData.content = content.trim();
    if (position) updateData.position = position;
    if (color) updateData.color = color;

    const postIt = await PostIt.updateById(req.params.id, updateData);
    res.json(postIt);
  } catch (error) {
    console.error('Error updating post-it:', error);
    if (error.message === 'Post-it not found') {
      return res.status(404).json({ error: 'Post-it not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid post-it ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/postits/:id/position - Update only position (for dragging)
router.patch('/:id/position', async (req, res) => {
  try {
    const { position } = req.body;
    
    if (!position) {
      return res.status(400).json({ error: 'Position data is required' });
    }

    const postIt = await PostIt.updatePosition(req.params.id, position);
    res.json(postIt);
  } catch (error) {
    console.error('Error updating post-it position:', error);
    if (error.message === 'Post-it not found') {
      return res.status(404).json({ error: 'Post-it not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid post-it ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/postits/:id/bring-to-front - Bring post-it to front
router.post('/:id/bring-to-front', async (req, res) => {
  try {
    const postIt = await PostIt.bringToFront(req.params.id);
    res.json(postIt);
  } catch (error) {
    console.error('Error bringing post-it to front:', error);
    if (error.message === 'Post-it not found') {
      return res.status(404).json({ error: 'Post-it not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid post-it ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/postits/bulk-update-positions - Bulk update positions
router.post('/bulk-update-positions', async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const result = await PostIt.bulkUpdatePositions(updates);
    res.json(result);
  } catch (error) {
    console.error('Error bulk updating positions:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/postits/:id - Delete post-it
router.delete('/:id', async (req, res) => {
  try {
    const result = await PostIt.deleteById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting post-it:', error);
    if (error.message === 'Post-it not found') {
      return res.status(404).json({ error: 'Post-it not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid post-it ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;