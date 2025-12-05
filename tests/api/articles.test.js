import { describe, it, expect, beforeEach } from 'vitest';
import { connectDB, closeDB, getDB } from '../../lib/database.js';
import Article from '../../lib/models/Article.js';

describe('Articles API Logic', () => {
  beforeEach(async () => {
    // Connect to database if not already connected
    const db = getDB();
    
    // Clear all tables
    db.exec('DELETE FROM postits');
    db.exec('DELETE FROM articles');
    db.exec('DELETE FROM tags');
  });

  describe('GET /api/articles', () => {
    it('should retrieve articles with pagination', async () => {
      // Create test data
      await Article.create({ title: 'Article 1', content: 'Content 1' });
      await Article.create({ title: 'Article 2', content: 'Content 2' });

      const result = await Article.findAll({ page: 1, limit: 10 });

      expect(result.articles).toBeDefined();
      expect(result.articles.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/articles', () => {
    it('should create a new article', async () => {
      const newArticle = {
        title: 'New Article',
        content: 'New content',
        summary: 'Summary',
        tags: ['test'],
      };

      const created = await Article.create(newArticle);

      expect(created.id).toBeDefined();
      expect(created.title).toBe('New Article');
      expect(created.content).toBe('New content');
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should retrieve a specific article', async () => {
      const created = await Article.create({ title: 'Specific', content: 'Content' });
      const found = await Article.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.title).toBe('Specific');
    });

    it('should return null for non-existent article', async () => {
      const found = await Article.findById(99999);
      expect(found).toBeNull();
    });
  });

  describe('PUT /api/articles/:id', () => {
    it('should update an article', async () => {
      const created = await Article.create({ title: 'Original', content: 'Content' });
      
      const updated = await Article.updateById(created.id, {
        title: 'Updated Title',
        content: 'Updated Content',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Updated Content');
      expect(updated.version).toBe(2);
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete an article', async () => {
      const created = await Article.create({ title: 'To Delete', content: 'Content' });
      
      const result = await Article.deleteById(created.id);
      expect(result.message).toContain('deleted successfully');

      const found = await Article.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
