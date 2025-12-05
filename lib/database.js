const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

const connectDB = () => {
  try {
    if (db) {
      console.log('Database already connected');
      return db;
    }

    console.log('Connecting to SQLite database...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('USE_TEST_DB:', process.env.USE_TEST_DB);
    
    // Determine database directory based on environment
    let dbDir;
    if (process.env.USE_TEST_DB === 'true' || process.env.NODE_ENV === 'test') {
      // Test environment - use current directory
      dbDir = process.cwd();
    } else if (process.env.CI) {
      // CI environment - use current directory (no /app/data access)
      dbDir = process.cwd();
    } else if (process.env.NODE_ENV === 'production') {
      // Production (Cloud Run) - use /app/data
      dbDir = '/app/data';
    } else {
      // Development - use current directory
      dbDir = process.cwd();
    }
    
    const dbName = (process.env.USE_TEST_DB === 'true' || process.env.NODE_ENV === 'test') ? 'test.db' : 'leylines.db';
    const dbPath = path.join(dbDir, dbName);
    console.log('Selected database:', dbName, 'at path:', dbPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    initializeTables();
    
    console.log('SQLite database connected successfully');
    console.log(`Database: ${dbPath}`);
    
    return db;
  } catch (error) {
    console.error('SQLite connection error:', error.message);
    throw error;
  }
};

const initializeTables = () => {
  // Articles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      version INTEGER DEFAULT 1,
      is_published BOOLEAN DEFAULT 0
    )
  `);

  // PostIts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS postits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      content TEXT NOT NULL DEFAULT 'New note...',
      position TEXT NOT NULL,
      color TEXT DEFAULT '#FBBF24',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )
  `);

  // Tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables initialized');
};

const getDB = () => {
  if (!db) {
    return connectDB();
  }
  return db;
};

const closeDB = () => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};

module.exports = { connectDB, initializeTables, getDB, closeDB };
