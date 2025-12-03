const { getDB } = require('../database');

class PostIt {
  constructor(data) {
    this.content = data.content;
    this.articleId = data.articleId;
    this.position = {
      x: data.position?.x || 0,
      y: data.position?.y || 0,
      width: data.position?.width || 200,
      height: data.position?.height || 150,
      zIndex: data.position?.zIndex || 1
    };
    this.color = data.color || '#FBBF24'; // Default yellow
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Create a new post-it
  static create(postItData) {
    const db = getDB();
    
    // Validate articleId exists
    const articleStmt = db.prepare('SELECT id FROM articles WHERE id = ?');
    const article = articleStmt.get(postItData.articleId);
    
    if (!article) {
      throw new Error('Article not found');
    }
    
    const postIt = new PostIt(postItData);
    
    const insertStmt = db.prepare(`
      INSERT INTO postits (content, articleId, position, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertStmt.run(
      postIt.content,
      postIt.articleId,
      JSON.stringify(postIt.position),
      postIt.color,
      postIt.createdAt,
      postIt.updatedAt
    );
    
    return { ...postIt, _id: result.lastInsertRowid.toString() };
  }

  // Get all post-its with optional filtering
  static findAll(options = {}) {
    const db = getDB();
    const { articleId, page = 1, limit = 50 } = options;
    
    let query = 'SELECT * FROM postits';
    let params = [];
    
    // Filter by article if provided
    if (articleId) {
      query += ' WHERE articleId = ?';
      params.push(articleId);
    }
    
    // Add ordering by zIndex and createdAt
    query += ' ORDER BY json_extract(position, "$.zIndex"), createdAt';
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const stmt = db.prepare(query);
    const postits = stmt.all(...params);
    
    // Parse position JSON and add _id
    const parsedPostits = postits.map(postit => {
      let position = {};
      try {
        position = JSON.parse(postit.position || '{}');
      } catch (e) {
        position = { x: 0, y: 0, width: 200, height: 150, zIndex: 1 };
      }
      
      return {
        ...postit,
        _id: postit.id.toString(),
        position
      };
    });
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM postits';
    let countParams = [];
    
    if (articleId) {
      countQuery += ' WHERE articleId = ?';
      countParams.push(articleId);
    }
    
    const countStmt = db.prepare(countQuery);
    const { count: total } = countStmt.get(...countParams);
    
    return {
      postits: parsedPostits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get post-its for a specific article
  static findByArticleId(articleId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT * FROM postits 
      WHERE articleId = ? 
      ORDER BY json_extract(position, "$.zIndex"), createdAt
    `);
    
    const postits = stmt.all(articleId);
    
    return postits.map(postit => {
      let position = {};
      try {
        position = JSON.parse(postit.position || '{}');
      } catch (e) {
        position = { x: 0, y: 0, width: 200, height: 150, zIndex: 1 };
      }
      
      return {
        ...postit,
        _id: postit.id.toString(),
        position
      };
    });
  }

  // Get post-it by ID
  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM postits WHERE id = ?');
    const postit = stmt.get(id);
    
    if (!postit) {
      return null;
    }
    
    let position = {};
    try {
      position = JSON.parse(postit.position || '{}');
    } catch (e) {
      position = { x: 0, y: 0, width: 200, height: 150, zIndex: 1 };
    }
    
    return {
      ...postit,
      _id: postit.id.toString(),
      position
    };
  }

  // Update post-it by ID
  static updateById(id, updateData) {
    const db = getDB();
    
    // Handle position updates specifically
    if (updateData.position) {
      updateData.position = JSON.stringify(updateData.position);
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    // Build dynamic update query
    const updateFields = Object.keys(updateData);
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateData);
    
    const updateStmt = db.prepare(`
      UPDATE postits 
      SET ${setClause}
      WHERE id = ?
    `);
    
    const result = updateStmt.run(...values, id);
    
    if (result.changes === 0) {
      throw new Error('Post-it not found');
    }
    
    return PostIt.findById(id);
  }

  // Update only position (for dragging)
  static updatePosition(id, position) {
    const db = getDB();
    
    const updateData = {
      position: {
        x: position.x,
        y: position.y,
        width: position.width || 200,
        height: position.height || 150,
        zIndex: position.zIndex || 1
      },
      updatedAt: new Date().toISOString()
    };
    
    const updateStmt = db.prepare(`
      UPDATE postits 
      SET position = ?, updatedAt = ?
      WHERE id = ?
    `);
    
    const result = updateStmt.run(
      JSON.stringify(updateData.position),
      updateData.updatedAt,
      id
    );
    
    if (result.changes === 0) {
      throw new Error('Post-it not found');
    }
    
    return PostIt.findById(id);
  }

  // Delete post-it by ID
  static deleteById(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM postits WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Post-it not found');
    }
    
    return { message: 'Post-it deleted successfully' };
  }

  // Delete all post-its for an article
  static deleteByArticleId(articleId) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM postits WHERE articleId = ?');
    const result = stmt.run(articleId);
    
    return { 
      message: `${result.changes} post-its deleted successfully`,
      deletedCount: result.changes
    };
  }

  // Get post-its count for an article
  static getCountByArticleId(articleId) {
    const db = getDB();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM postits WHERE articleId = ?');
    const { count } = stmt.get(articleId);
    return count;
  }

  // Bulk update positions (for layout changes)
  static bulkUpdatePositions(updates) {
    const db = getDB();
    
    if (updates.length === 0) {
      return { message: 'No updates provided' };
    }
    
    const updateStmt = db.prepare(`
      UPDATE postits 
      SET position = ?, updatedAt = ?
      WHERE id = ?
    `);
    
    const updateTransaction = db.transaction((updates) => {
      let modifiedCount = 0;
      const updatedAt = new Date().toISOString();
      
      for (const update of updates) {
        const result = updateStmt.run(
          JSON.stringify(update.position),
          updatedAt,
          update.id
        );
        modifiedCount += result.changes;
      }
      
      return modifiedCount;
    });
    
    const modifiedCount = updateTransaction(updates);
    
    return {
      message: `${modifiedCount} post-its updated successfully`,
      modifiedCount
    };
  }

  // Get highest z-index for an article (for bringing to front)
  static getMaxZIndex(articleId) {
    const db = getDB();
    
    const stmt = db.prepare(`
      SELECT json_extract(position, '$.zIndex') as zIndex 
      FROM postits 
      WHERE articleId = ? 
      ORDER BY json_extract(position, '$.zIndex') DESC 
      LIMIT 1
    `);
    
    const result = stmt.get(articleId);
    return result ? parseInt(result.zIndex) : 0;
  }

  // Bring post-it to front
  static bringToFront(id) {
    const db = getDB();
    
    const postIt = PostIt.findById(id);
    if (!postIt) {
      throw new Error('Post-it not found');
    }
    
    const maxZIndex = PostIt.getMaxZIndex(postIt.articleId);
    
    return PostIt.updatePosition(id, {
      ...postIt.position,
      zIndex: maxZIndex + 1
    });
  }
}

module.exports = PostIt;