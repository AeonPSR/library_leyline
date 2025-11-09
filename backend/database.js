const Database = require('better-sqlite3');
const path = require('path');

let db = null;

const connectDB = () => {
  try {
    if (db) {
      console.log('Database already connected');
      return db;
    }

    console.log('Connecting to SQLite database...');
    
    // Create database file in backend directory
    const dbPath = path.join(__dirname, 'leylines.db');
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
    process.exit(1);
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

module.exports = { connectDB, getDB, closeDB };