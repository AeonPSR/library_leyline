const { getDB } = require('../database');

class Article {
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.summary = data.summary || '';
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.version = data.version || 1;
    this.isPublished = data.isPublished || false;
  }

  // Create a new article
  static async create(articleData) {
    const db = getDB();
    const article = new Article(articleData);
    
    // Prepare the insert statement
    const stmt = db.prepare(`
      INSERT INTO articles (title, content, summary, tags, created_at, updated_at, version, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      article.title || '',
      article.content,
      article.summary,
      JSON.stringify(article.tags),
      article.createdAt.toISOString(),
      article.updatedAt.toISOString(),
      article.version,
      article.isPublished ? 1 : 0
    );
    
    const createdArticle = { ...article, id: result.lastInsertRowid };
    
    // If no title provided, use the ID as title
    if (!articleData.title || articleData.title.trim() === '') {
      const updateStmt = db.prepare('UPDATE articles SET title = ? WHERE id = ?');
      updateStmt.run(result.lastInsertRowid.toString(), result.lastInsertRowid);
      createdArticle.title = result.lastInsertRowid.toString();
    }
    
    return createdArticle;
  }

  // Get all articles
  static async findAll(options = {}) {
    const db = getDB();
    const { page = 1, limit = 10, tags, search } = options;
    
    let whereClause = '';
    let params = [];
    
    // Build WHERE conditions
    let conditions = [];
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
      conditions.push(`(${tagConditions})`);
      tags.forEach(tag => params.push(`%"${tag}"%`));
    }
    
    // Search in title and content if provided
    if (search) {
      conditions.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }
    
    const offset = (page - 1) * limit;
    
    // Get articles with pagination
    const stmt = db.prepare(`
      SELECT * FROM articles 
      ${whereClause}
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM articles 
      ${whereClause}
    `);
    
    const articles = stmt.all(...params, limit, offset).map(row => ({
      id: row.id,
      _id: row.id, // For compatibility with frontend
      title: row.title,
      content: row.content,
      summary: row.summary,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      version: row.version,
      isPublished: Boolean(row.is_published)
    }));
    
    const totalResult = countStmt.get(...params);
    const total = totalResult.total;
    
    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get article by ID
  static async findById(id) {
    const db = getDB();
    
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      _id: row.id, // For compatibility with frontend
      title: row.title,
      content: row.content,
      summary: row.summary,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      version: row.version,
      isPublished: Boolean(row.is_published)
    };
  }

  // Update article by ID
  static async updateById(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    
    // Get current version
    const currentStmt = db.prepare('SELECT version FROM articles WHERE id = ?');
    const current = currentStmt.get(id);
    
    if (!current) {
      throw new Error('Article not found');
    }
    
    updateData.version = current.version + 1;
    
    // Build dynamic update query
    const fields = Object.keys(updateData);
    const setClause = fields.map(field => {
      if (field === 'tags') return 'tags = ?';
      if (field === 'updatedAt') return 'updated_at = ?';
      if (field === 'isPublished') return 'is_published = ?';
      return `${field} = ?`;
    }).join(', ');
    
    const values = fields.map(field => {
      if (field === 'tags') return JSON.stringify(updateData[field]);
      if (field === 'updatedAt') return updateData[field].toISOString();
      if (field === 'isPublished') return updateData[field] ? 1 : 0;
      return updateData[field];
    });
    
    const stmt = db.prepare(`UPDATE articles SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...values, id);
    
    if (result.changes === 0) {
      throw new Error('Article not found');
    }
    
    return await Article.findById(id);
  }

  // Delete article by ID
  static async deleteById(id) {
    const db = getDB();
    
    // Delete using foreign key cascade (postits will be deleted automatically)
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Article not found');
    }
    
    return { message: 'Article and associated post-its deleted successfully' };
  }

  // Add tags to article
  static async addTags(id, tags) {
    const db = getDB();
    
    // Get current article
    const article = await Article.findById(id);
    if (!article) {
      throw new Error('Article not found');
    }
    
    // Merge with existing tags (remove duplicates)
    const existingTags = article.tags || [];
    const newTags = [...new Set([...existingTags, ...tags])];
    
    const stmt = db.prepare('UPDATE articles SET tags = ?, updated_at = ? WHERE id = ?');
    stmt.run(JSON.stringify(newTags), new Date().toISOString(), id);
    
    return await Article.findById(id);
  }

  // Remove tags from article
  static async removeTags(id, tags) {
    const db = getDB();
    
    // Get current article
    const article = await Article.findById(id);
    if (!article) {
      throw new Error('Article not found');
    }
    
    // Remove specified tags
    const existingTags = article.tags || [];
    const newTags = existingTags.filter(tag => !tags.includes(tag));
    
    const stmt = db.prepare('UPDATE articles SET tags = ?, updated_at = ? WHERE id = ?');
    stmt.run(JSON.stringify(newTags), new Date().toISOString(), id);
    
    return await Article.findById(id);
  }
}

module.exports = Article;