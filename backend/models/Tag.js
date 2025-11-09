const { getDB } = require('../database');

class Tag {
  constructor(data) {
    this.name = data.name;
    this.description = data.description || '';
    this.color = data.color || '#3B82F6'; // Default blue color
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Create a new tag
  static create(tagData) {
    const db = getDB();
    
    // Check if tag already exists (case insensitive)
    const checkStmt = db.prepare(`SELECT * FROM tags WHERE LOWER(name) = LOWER(?)`);
    const existingTag = checkStmt.get(tagData.name);
    
    if (existingTag) {
      throw new Error('Tag already exists');
    }
    
    const tag = new Tag(tagData);
    const insertStmt = db.prepare(`
      INSERT INTO tags (name, description, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insertStmt.run(
      tag.name,
      tag.description,
      tag.color,
      tag.createdAt,
      tag.updatedAt
    );
    
    return { ...tag, _id: result.lastInsertRowid.toString() };
  }

  // Get all tags
  static findAll(options = {}) {
    const db = getDB();
    const { search, sortBy = 'name' } = options;
    
    let query = 'SELECT * FROM tags';
    let params = [];
    
    // Search in name and description if provided
    if (search) {
      query += ' WHERE name LIKE ? OR description LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    // Add sorting
    query += ` ORDER BY ${sortBy}`;
    
    const stmt = db.prepare(query);
    const tags = stmt.all(...params);
    
    return tags.map(tag => ({ ...tag, _id: tag.id?.toString() || tag._id }));
  }

  // Get tag by ID
  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM tags WHERE id = ?');
    const tag = stmt.get(id);
    
    if (tag) {
      return { ...tag, _id: tag.id.toString() };
    }
    return null;
  }

  // Get tag by name
  static findByName(name) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM tags WHERE LOWER(name) = LOWER(?)');
    const tag = stmt.get(name);
    
    if (tag) {
      return { ...tag, _id: tag.id.toString() };
    }
    return null;
  }

  // Update tag by ID
  static updateById(id, updateData) {
    const db = getDB();
    
    // If updating name, check for duplicates
    if (updateData.name) {
      const checkStmt = db.prepare(`
        SELECT * FROM tags 
        WHERE LOWER(name) = LOWER(?) AND id != ?
      `);
      const existingTag = checkStmt.get(updateData.name, id);
      
      if (existingTag) {
        throw new Error('Tag name already exists');
      }
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    // Build dynamic update query
    const updateFields = Object.keys(updateData);
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateData);
    
    const updateStmt = db.prepare(`
      UPDATE tags 
      SET ${setClause}
      WHERE id = ?
    `);
    
    const result = updateStmt.run(...values, id);
    
    if (result.changes === 0) {
      throw new Error('Tag not found');
    }
    
    return Tag.findById(id);
  }

  // Delete tag by ID
  static deleteById(id) {
    const db = getDB();
    
    // First, get the tag name to remove from articles
    const tagStmt = db.prepare('SELECT name FROM tags WHERE id = ?');
    const tag = tagStmt.get(id);
    
    if (!tag) {
      throw new Error('Tag not found');
    }
    
    // Remove this tag from all articles
    const articlesStmt = db.prepare('SELECT id, tags FROM articles');
    const articles = articlesStmt.all();
    
    const updateStmt = db.prepare('UPDATE articles SET tags = ? WHERE id = ?');
    
    articles.forEach(article => {
      if (article.tags) {
        let tags = JSON.parse(article.tags);
        if (Array.isArray(tags)) {
          tags = tags.filter(tagName => tagName !== tag.name);
          updateStmt.run(JSON.stringify(tags), article.id);
        }
      }
    });
    
    // Then delete the tag
    const deleteStmt = db.prepare('DELETE FROM tags WHERE id = ?');
    const result = deleteStmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Tag not found');
    }
    
    return { message: 'Tag deleted successfully' };
  }

  // Helper method to get tag name by ID
  static getTagNameById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT name FROM tags WHERE id = ?');
    const tag = stmt.get(id);
    return tag ? tag.name : null;
  }

  // Get articles count for each tag
  static getTagsWithArticleCount() {
    const db = getDB();
    
    const tagsStmt = db.prepare('SELECT * FROM tags ORDER BY name');
    const tags = tagsStmt.all();
    
    const articlesStmt = db.prepare('SELECT tags FROM articles');
    const articles = articlesStmt.all();
    
    // Count articles for each tag
    const tagCounts = {};
    
    articles.forEach(article => {
      if (article.tags) {
        try {
          const articleTags = JSON.parse(article.tags);
          if (Array.isArray(articleTags)) {
            articleTags.forEach(tagName => {
              tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            });
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    });
    
    return tags.map(tag => ({
      ...tag,
      _id: tag.id.toString(),
      articleCount: tagCounts[tag.name] || 0
    }));
  }

  // Get popular tags (most used)
  static getPopularTags(limit = 10) {
    const db = getDB();
    
    const articlesStmt = db.prepare('SELECT tags FROM articles');
    const articles = articlesStmt.all();
    
    // Count tag usage
    const tagCounts = {};
    
    articles.forEach(article => {
      if (article.tags) {
        try {
          const articleTags = JSON.parse(article.tags);
          if (Array.isArray(articleTags)) {
            articleTags.forEach(tagName => {
              tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            });
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    });
    
    // Sort by count and get tag info
    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
    
    const tagStmt = db.prepare('SELECT * FROM tags WHERE name = ?');
    
    return sortedTags.map(([tagName, count]) => {
      const tagInfo = tagStmt.get(tagName);
      return {
        name: tagName,
        count,
        tagInfo: tagInfo ? { ...tagInfo, _id: tagInfo.id.toString() } : null
      };
    });
  }
}

module.exports = Tag;