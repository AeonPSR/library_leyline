import { beforeAll, afterAll, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { closeDB } from '../lib/database.js';

// Use a test database
process.env.NODE_ENV = 'test';
const testDbPath = path.join(process.cwd(), 'test.db');

beforeAll(() => {
  // Clean up any existing test database
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    } catch (err) {
      // Ignore if file is locked
    }
  }
});

afterAll(() => {
  // Close database connection first
  closeDB();
  
  // Wait a bit for the file handle to be released
  setTimeout(() => {
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        // Ignore cleanup errors
        console.log('Note: test.db will be cleaned up on next run');
      }
    }
  }, 100);
});
