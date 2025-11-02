const { ObjectId } = require('mongodb');
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
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new post-it
  static async create(postItData) {
    const db = getDB();
    
    // Validate articleId exists
    const article = await db.collection('articles').findOne({ _id: new ObjectId(postItData.articleId) });
    if (!article) {
      throw new Error('Article not found');
    }
    
    const postIt = new PostIt(postItData);
    const result = await db.collection('postits').insertOne(postIt);
    
    return { ...postIt, _id: result.insertedId };
  }

  // Get all post-its with optional filtering
  static async findAll(options = {}) {
    const db = getDB();
    const { articleId, page = 1, limit = 50 } = options;
    
    let query = {};
    
    // Filter by article if provided
    if (articleId) {
      query.articleId = articleId;
    }

    const skip = (page - 1) * limit;
    
    const postits = await db.collection('postits')
      .find(query)
      .sort({ 'position.zIndex': 1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('postits').countDocuments(query);
    
    return {
      postits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get post-its for a specific article
  static async findByArticleId(articleId) {
    const db = getDB();
    return await db.collection('postits')
      .find({ articleId })
      .sort({ 'position.zIndex': 1, createdAt: 1 })
      .toArray();
  }

  // Get post-it by ID
  static async findById(id) {
    const db = getDB();
    return await db.collection('postits').findOne({ _id: new ObjectId(id) });
  }

  // Update post-it by ID
  static async updateById(id, updateData) {
    const db = getDB();
    
    // Handle position updates specifically
    if (updateData.position) {
      updateData.position = {
        ...updateData.position
      };
    }
    
    updateData.updatedAt = new Date();
    
    const result = await db.collection('postits').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Post-it not found');
    }
    
    return await PostIt.findById(id);
  }

  // Update only position (for dragging)
  static async updatePosition(id, position) {
    const db = getDB();
    
    const updateData = {
      position: {
        x: position.x,
        y: position.y,
        width: position.width || 200,
        height: position.height || 150,
        zIndex: position.zIndex || 1
      },
      updatedAt: new Date()
    };
    
    const result = await db.collection('postits').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Post-it not found');
    }
    
    return await PostIt.findById(id);
  }

  // Delete post-it by ID
  static async deleteById(id) {
    const db = getDB();
    const result = await db.collection('postits').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      throw new Error('Post-it not found');
    }
    
    return { message: 'Post-it deleted successfully' };
  }

  // Delete all post-its for an article
  static async deleteByArticleId(articleId) {
    const db = getDB();
    const result = await db.collection('postits').deleteMany({ articleId });
    
    return { 
      message: `${result.deletedCount} post-its deleted successfully`,
      deletedCount: result.deletedCount
    };
  }

  // Get post-its count for an article
  static async getCountByArticleId(articleId) {
    const db = getDB();
    return await db.collection('postits').countDocuments({ articleId });
  }

  // Bulk update positions (for layout changes)
  static async bulkUpdatePositions(updates) {
    const db = getDB();
    
    const operations = updates.map(update => ({
      updateOne: {
        filter: { _id: new ObjectId(update.id) },
        update: {
          $set: {
            position: update.position,
            updatedAt: new Date()
          }
        }
      }
    }));
    
    if (operations.length === 0) {
      return { message: 'No updates provided' };
    }
    
    const result = await db.collection('postits').bulkWrite(operations);
    
    return {
      message: `${result.modifiedCount} post-its updated successfully`,
      modifiedCount: result.modifiedCount
    };
  }

  // Get highest z-index for an article (for bringing to front)
  static async getMaxZIndex(articleId) {
    const db = getDB();
    
    const result = await db.collection('postits')
      .findOne(
        { articleId },
        { sort: { 'position.zIndex': -1 } }
      );
    
    return result ? result.position.zIndex : 0;
  }

  // Bring post-it to front
  static async bringToFront(id) {
    const db = getDB();
    
    const postIt = await PostIt.findById(id);
    if (!postIt) {
      throw new Error('Post-it not found');
    }
    
    const maxZIndex = await PostIt.getMaxZIndex(postIt.articleId);
    
    return await PostIt.updatePosition(id, {
      ...postIt.position,
      zIndex: maxZIndex + 1
    });
  }
}

module.exports = PostIt;