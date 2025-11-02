const { ObjectId } = require('mongodb');
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
    
    const result = await db.collection('articles').insertOne(article);
    const createdArticle = { ...article, _id: result.insertedId };
    
    // If no title provided, use the ID as title
    if (!articleData.title || articleData.title.trim() === '') {
      await db.collection('articles').updateOne(
        { _id: result.insertedId },
        { $set: { title: result.insertedId.toString() } }
      );
      createdArticle.title = result.insertedId.toString();
    }
    
    return createdArticle;
  }

  // Get all articles
  static async findAll(options = {}) {
    const db = getDB();
    const { page = 1, limit = 10, tags, search } = options;
    
    let query = {};
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    // Search in title and content if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const articles = await db.collection('articles')
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('articles').countDocuments(query);
    
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
    return await db.collection('articles').findOne({ _id: new ObjectId(id) });
  }

  // Update article by ID
  static async updateById(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    updateData.version = updateData.version ? updateData.version + 1 : 1;
    
    const result = await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Article not found');
    }
    
    return await Article.findById(id);
  }

  // Delete article by ID
  static async deleteById(id) {
    const db = getDB();
    
    // First delete all post-its associated with this article
    await db.collection('postits').deleteMany({ articleId: id });
    
    const result = await db.collection('articles').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      throw new Error('Article not found');
    }
    
    return { message: 'Article and associated post-its deleted successfully' };
  }

  // Add tags to article
  static async addTags(id, tags) {
    const db = getDB();
    const result = await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { 
        $addToSet: { tags: { $each: tags } },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Article not found');
    }
    
    return await Article.findById(id);
  }

  // Remove tags from article
  static async removeTags(id, tags) {
    const db = getDB();
    const result = await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { 
        $pullAll: { tags: tags },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Article not found');
    }
    
    return await Article.findById(id);
  }
}

module.exports = Article;