const express = require('express');
const Article = require('../models/Article');
const PostIt = require('../models/PostIt');
const router = express.Router();

// GET /api/articles - Get all articles with optional filtering
router.get('/', async (req, res) => {
  try {
    const { page, limit, tags, search } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      tags: tags ? tags.split(',') : undefined,
      search: search || undefined
    };

    const result = await Article.findAll(options);
    res.json(result);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/:id - Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles - Create new article
router.post('/', async (req, res) => {
  try {
    const { title, content, summary, tags, isPublished } = req.body;
    
    // Content is optional now since we use post-its
    const articleData = {
      title: title ? title.trim() : '', // Will be set to ID if empty
      content: content ? content.trim() : '',
      summary: summary ? summary.trim() : '',
      tags: tags || [],
      isPublished: isPublished || false
    };

    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles/quick - Quick create article (no form needed)
router.post('/quick', async (req, res) => {
  try {
    const articleData = {
      title: '', // Will be set to ID automatically
      content: '',
      summary: 'New post-it board',
      tags: [],
      isPublished: false
    };

    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating quick article:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/articles/:id - Update article
router.put('/:id', async (req, res) => {
  try {
    const { title, content, summary, tags, isPublished } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (tags !== undefined) updateData.tags = tags;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const article = await Article.updateById(req.params.id, updateData);
    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/articles/:id - Delete article
router.delete('/:id', async (req, res) => {
  try {
    const result = await Article.deleteById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting article:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles/:id/tags - Add tags to article
router.post('/:id/tags', async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be provided as an array' });
    }

    const article = await Article.addTags(req.params.id, tags);
    res.json(article);
  } catch (error) {
    console.error('Error adding tags to article:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/articles/:id/tags - Remove tags from article
router.delete('/:id/tags', async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be provided as an array' });
    }

    const article = await Article.removeTags(req.params.id, tags);
    res.json(article);
  } catch (error) {
    console.error('Error removing tags from article:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/:id/postits - Get all post-its for an article
router.get('/:id/postits', async (req, res) => {
  try {
    // First check if article exists
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const postits = await PostIt.findByArticleId(req.params.id);
    const count = await PostIt.getCountByArticleId(req.params.id);
    
    res.json({
      articleId: req.params.id,
      articleTitle: article.title,
      postits,
      count
    });
  } catch (error) {
    console.error('Error fetching post-its for article:', error);
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ error: 'Invalid article ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;