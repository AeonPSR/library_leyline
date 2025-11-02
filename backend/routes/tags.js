const express = require('express');
const Tag = require('../models/Tag');
const router = express.Router();

// GET /api/tags - Get all tags
router.get('/', async (req, res) => {
  try {
    const { search, sortBy, withCount } = req.query;
    
    if (withCount === 'true') {
      const tags = await Tag.getTagsWithArticleCount();
      return res.json(tags);
    }
    
    const options = {
      search: search || undefined,
      sortBy: sortBy || 'name'
    };

    const tags = await Tag.findAll(options);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/popular - Get popular tags (most used)
router.get('/popular', async (req, res) => {
  try {
    const { limit } = req.query;
    const popularTags = await Tag.getPopularTags(parseInt(limit) || 10);
    res.json(popularTags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/:id - Get tag by ID
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid tag ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tags - Create new tag
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const tagData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#3B82F6'
    };

    const tag = await Tag.create(tagData);
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error.message === 'Tag already exists') {
      return res.status(409).json({ error: 'Tag already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (color) updateData.color = color;

    const tag = await Tag.updateById(req.params.id, updateData);
    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }
    if (error.message === 'Tag name already exists') {
      return res.status(409).json({ error: 'Tag name already exists' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid tag ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', async (req, res) => {
  try {
    const result = await Tag.deleteById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting tag:', error);
    if (error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid tag ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/name/:name - Get tag by name
router.get('/name/:name', async (req, res) => {
  try {
    const tag = await Tag.findByName(req.params.name);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag by name:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;