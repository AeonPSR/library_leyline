const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./database');
const articlesRoutes = require('./routes/articles');
const tagsRoutes = require('./routes/tags');
const postitsRoutes = require('./routes/postits');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Library Website Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/articles', articlesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/postits', postitsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = () => {
  try {
    connectDB(); // SQLite connection is synchronous
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Library Website Backend API`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Articles API: http://localhost:${PORT}/api/articles`);
      console.log(`Tags API: http://localhost:${PORT}/api/tags`);
      console.log(`Post-its API: http://localhost:${PORT}/api/postits`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();