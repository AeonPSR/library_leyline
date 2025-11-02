const { MongoClient } = require('mongodb');

let db = null;
let client = null;

const connectDB = async () => {
  try {
    if (db) {
      console.log('📦 Database already connected');
      return db;
    }

    console.log('🔌 Connecting to MongoDB...');
    
    client = new MongoClient(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db(process.env.DB_NAME);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📚 Database: ${process.env.DB_NAME}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('🔚 MongoDB connection closed');
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB
};