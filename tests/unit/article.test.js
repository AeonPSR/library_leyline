import { describe, it, expect, beforeEach } from 'vitest';
import Article from '../../lib/models/Article.js';
import { connectDB, closeDB, getDB } from '../../lib/database.js';

describe('Article Model', () => {
  beforeEach(async () => {
    // Close any existing connection and reconnect
    closeDB();
    connectDB();
    
    // Clear all tables
    const db = getDB();
    db.exec('DELETE FROM postits');
    db.exec('DELETE FROM articles');
    db.exec('DELETE FROM tags');
  });

  describe('create', () => {
    it('should create a new article with all fields', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'This is test content',
        summary: 'Test summary',
        tags: ['test', 'vitest'],
        isPublished: true,
      };

      const article = await Article.create(articleData);

      expect(article).toBeDefined();
      expect(article.id).toBeDefined();
      expect(article._id).toBe(article.id); // Compatibility check
      expect(article.title).toBe('Test Article');
      expect(article.content).toBe('This is test content');
      expect(article.summary).toBe('Test summary');
      expect(article.tags).toEqual(['test', 'vitest']);
      expect(article.isPublished).toBe(true);
      expect(article.version).toBe(1);
    });

    it('should create article with default title if not provided', async () => {
      const articleData = {
        content: 'Content without title',
      };

      const article = await Article.create(articleData);

      expect(article.title).toBe(article.id.toString());
    });

    it('should create article with default values', async () => {
      const articleData = {
        title: 'Minimal Article',
        content: 'Just content',
      };

      const article = await Article.create(articleData);

      expect(article.summary).toBe('');
      expect(article.tags).toEqual([]);
      expect(article.isPublished).toBe(false);
      expect(article.version).toBe(1);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create some test articles
      await Article.create({ title: 'Article 1', content: 'Content 1', tags: ['tag1'] });
      await Article.create({ title: 'Article 2', content: 'Content 2', tags: ['tag2'] });
      await Article.create({ title: 'Article 3', content: 'Content 3', tags: ['tag1', 'tag2'] });
    });

    it('should return all articles with pagination', async () => {
      const result = await Article.findAll({ page: 1, limit: 10 });

      expect(result.articles).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(1);
    });

    it('should filter by tags', async () => {
      const result = await Article.findAll({ tags: ['tag1'] });

      expect(result.articles.length).toBeGreaterThanOrEqual(2);
      result.articles.forEach(article => {
        expect(article.tags).toContain('tag1');
      });
    });

    it('should search by title and content', async () => {
      const result = await Article.findAll({ search: 'Article 2' });

      expect(result.articles.length).toBeGreaterThanOrEqual(1);
      expect(result.articles[0].title).toBe('Article 2');
    });
  });

  describe('findById', () => {
    it('should find article by id', async () => {
      const created = await Article.create({ title: 'Find Me', content: 'Content' });
      const found = await Article.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.title).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const found = await Article.findById(99999);
      expect(found).toBeNull();
    });
  });

  describe('updateById', () => {
    it('should update article fields', async () => {
      const created = await Article.create({ title: 'Original', content: 'Original content' });
      
      const updated = await Article.updateById(created.id, {
        title: 'Updated',
        content: 'Updated content',
      });

      expect(updated.title).toBe('Updated');
      expect(updated.content).toBe('Updated content');
      expect(updated.version).toBe(2); // Version incremented
    });

    it('should throw error for non-existent article', async () => {
      await expect(Article.updateById(99999, { title: 'Test' }))
        .rejects.toThrow('Article not found');
    });
  });

  describe('deleteById', () => {
    it('should delete an article', async () => {
      const created = await Article.create({ title: 'Delete Me', content: 'Content' });
      
      const result = await Article.deleteById(created.id);
      expect(result.message).toContain('deleted successfully');

      const found = await Article.findById(created.id);
      expect(found).toBeNull();
    });

    it('should throw error when deleting non-existent article', async () => {
      await expect(Article.deleteById(99999))
        .rejects.toThrow('Article not found');
    });
  });

  describe('tag operations', () => {
    it('should add tags to article', async () => {
      const created = await Article.create({ title: 'Test', content: 'Content', tags: ['tag1'] });
      
      const updated = await Article.addTags(created.id, ['tag2', 'tag3']);
      
      expect(updated.tags).toContain('tag1');
      expect(updated.tags).toContain('tag2');
      expect(updated.tags).toContain('tag3');
    });

    it('should remove tags from article', async () => {
      const created = await Article.create({ 
        title: 'Test', 
        content: 'Content', 
        tags: ['tag1', 'tag2', 'tag3'] 
      });
      
      const updated = await Article.removeTags(created.id, ['tag2']);
      
      expect(updated.tags).toContain('tag1');
      expect(updated.tags).not.toContain('tag2');
      expect(updated.tags).toContain('tag3');
    });
  });
});
