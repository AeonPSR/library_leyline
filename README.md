# Personal Library Website

A modern web application for organizing and managing your personal library using an innovative post-it board system. Instead of traditional articles, content is organized as interactive post-it notes on boards.

## 🚀 Current Features

### Core System
- **Post-it Board Concept**: Articles act as boards containing moveable post-it notes
- **Drag & Drop Interface**: Move post-its around boards with visual drag handles
- **Real-time Updates**: All changes sync immediately with the database
- **Responsive Design**: Works on desktop and mobile devices

### Article Management
- **Quick Article Creation**: Create new boards with auto-generated titles
- **Inline Title Editing**: Click to edit article titles directly
- **Article Statistics**: View post-it count and last updated date
- **Board Overview**: Visual representation of content organization

### Post-it System
- **Interactive Post-its**: Click to edit content, drag to reposition
- **Color Customization**: Choose from multiple post-it colors
- **Flexible Sizing**: Post-its maintain their dimensions and positions
- **Z-index Management**: Proper layering when post-its overlap
- **Delete Protection**: Confirm before removing post-its

### Tag Management
- **Visual Tag System**: Color-coded tags for categorization
- **In-modal Tag Creation**: Create tags directly from article view
- **Tag Assignment**: Add/remove tags from articles with one click
- **Confirmation Dialogs**: Prevent accidental tag removal
- **Tag Statistics**: Track tag usage across articles

### User Experience
- **Modal Interfaces**: Clean, focused dialogs for tag management
- **Click-outside-to-close**: Intuitive modal behavior
- **Visual Feedback**: Hover effects and transitions
- **Loading States**: Progress indicators for async operations
- **Error Handling**: User-friendly error messages

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript/React** - Interactive UI components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **CORS & Security** - Cross-origin requests and security headers

### Database Schema
- **Articles Collection**: Board metadata and tag references
- **PostIts Collection**: Individual post-it content and positions
- **Tags Collection**: Tag definitions with colors and descriptions

## 📁 Project Structure

```
library_website/
├── backend/
│   ├── models/          # Database models (Article, PostIt, Tag)
│   ├── routes/          # API endpoints
│   ├── config/          # Database connection
│   └── server.js        # Express server
├── frontend/
│   ├── app/
│   │   ├── articles/    # Article management pages
│   │   ├── tags/        # Tag management pages
│   │   └── components/  # Reusable UI components
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

### Articles
- `GET /api/articles` - List all articles
- `POST /api/articles` - Create new article
- `GET /api/articles/:id` - Get specific article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST/DELETE /api/articles/:id/tags` - Manage article tags

### Post-its
- `GET /api/articles/:id/postits` - Get article's post-its
- `POST /api/postits` - Create new post-it
- `PUT /api/postits/:id` - Update post-it content
- `PATCH /api/postits/:id/position` - Update post-it position
- `DELETE /api/postits/:id` - Delete post-it

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## 🎯 Key Innovations

1. **Post-it Board System**: Replaces traditional linear article format with spatial organization
2. **Drag & Drop UX**: Natural interaction model for content arrangement
3. **In-context Tag Management**: Create and assign tags without leaving the article view
4. **Real-time Position Sync**: Maintains exact post-it positions across sessions
5. **Confirmation Workflows**: Prevents accidental data loss with user confirmations

## 🔧 Development Status

**Current State**: Fully functional with all core features implemented
**Backend**: Complete REST API with MongoDB integration
**Frontend**: Interactive UI with drag-and-drop post-it management
**Database**: Cloud-hosted MongoDB Atlas with proper collections and relationships

## 🚀 Getting Started

1. **Backend**: Navigate to `/backend` and run `npm run dev`
2. **Frontend**: Navigate to `/frontend` and run `npm run dev`
3. **Database**: MongoDB Atlas connection configured via environment variables

The application will be available at `http://localhost:3000` (frontend) with API at `http://localhost:5000` (backend).