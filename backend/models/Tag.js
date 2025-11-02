const { ObjectId } = require('mongodb');
const { getDB } = require('../database');

class Tag {
  constructor(data) {
    this.name = data.name;
    this.description = data.description || '';
    this.color = data.color || '#3B82F6'; // Default blue color
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new tag
  static async create(tagData) {
    const db = getDB();
    
    // Check if tag already exists (case insensitive)
    const existingTag = await db.collection('tags').findOne({ 
      name: { $regex: `^${tagData.name}$`, $options: 'i' } 
    });
    
    if (existingTag) {
      throw new Error('Tag already exists');
    }
    
    const tag = new Tag(tagData);
    const result = await db.collection('tags').insertOne(tag);
    
    return { ...tag, _id: result.insertedId };
  }

  // Get all tags
  static async findAll(options = {}) {
    const db = getDB();
    const { search, sortBy = 'name' } = options;
    
    let query = {};
    
    // Search in name and description if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = 1;
    
    const tags = await db.collection('tags')
      .find(query)
      .sort(sortOptions)
      .toArray();
    
    return tags;
  }

  // Get tag by ID
  static async findById(id) {
    const db = getDB();
    return await db.collection('tags').findOne({ _id: new ObjectId(id) });
  }

  // Get tag by name
  static async findByName(name) {
    const db = getDB();
    return await db.collection('tags').findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' } 
    });
  }

  // Update tag by ID
  static async updateById(id, updateData) {
    const db = getDB();
    
    // If updating name, check for duplicates
    if (updateData.name) {
      const existingTag = await db.collection('tags').findOne({ 
        name: { $regex: `^${updateData.name}$`, $options: 'i' },
        _id: { $ne: new ObjectId(id) }
      });
      
      if (existingTag) {
        throw new Error('Tag name already exists');
      }
    }
    
    updateData.updatedAt = new Date();
    
    const result = await db.collection('tags').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Tag not found');
    }
    
    return await Tag.findById(id);
  }

  // Delete tag by ID
  static async deleteById(id) {
    const db = getDB();
    
    // First, remove this tag from all articles
    await db.collection('articles').updateMany(
      { tags: { $in: [await Tag.getTagNameById(id)] } },
      { $pull: { tags: await Tag.getTagNameById(id) } }
    );
    
    // Then delete the tag
    const result = await db.collection('tags').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      throw new Error('Tag not found');
    }
    
    return { message: 'Tag deleted successfully' };
  }

  // Helper method to get tag name by ID
  static async getTagNameById(id) {
    const db = getDB();
    const tag = await db.collection('tags').findOne({ _id: new ObjectId(id) });
    return tag ? tag.name : null;
  }

  // Get articles count for each tag
  static async getTagsWithArticleCount() {
    const db = getDB();
    
    const pipeline = [
      {
        $lookup: {
          from: 'articles',
          localField: 'name',
          foreignField: 'tags',
          as: 'articles'
        }
      },
      {
        $addFields: {
          articleCount: { $size: '$articles' }
        }
      },
      {
        $project: {
          articles: 0 // Remove the articles array from the result
        }
      },
      {
        $sort: { name: 1 }
      }
    ];
    
    return await db.collection('tags').aggregate(pipeline).toArray();
  }

  // Get popular tags (most used)
  static async getPopularTags(limit = 10) {
    const db = getDB();
    
    const pipeline = [
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: 'name',
          as: 'tagInfo'
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          tagInfo: { $arrayElemAt: ['$tagInfo', 0] }
        }
      }
    ];
    
    return await db.collection('articles').aggregate(pipeline).toArray();
  }
}

module.exports = Tag;