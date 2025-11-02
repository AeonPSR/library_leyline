# Post-It Board API Testing Guide

## Test the API endpoints with these curl commands or use in a tool like Postman

### 1. Create an Article (Board)
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Board",
    "summary": "A board for testing post-its",
    "tags": ["test", "board"]
  }'
```

### 2. Create Post-Its
Replace `ARTICLE_ID` with the actual ID from step 1:

```bash
# First post-it
curl -X POST http://localhost:5000/api/postits \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my first post-it!",
    "articleId": "ARTICLE_ID",
    "position": {
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 150
    },
    "color": "#FBBF24"
  }'

# Second post-it
curl -X POST http://localhost:5000/api/postits \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Another note here",
    "articleId": "ARTICLE_ID",
    "position": {
      "x": 350,
      "y": 200,
      "width": 180,
      "height": 120
    },
    "color": "#F87171"
  }'
```

### 3. Get All Post-Its for an Article
```bash
curl http://localhost:5000/api/articles/ARTICLE_ID/postits
```

### 4. Update Post-It Position (simulate dragging)
Replace `POSTIT_ID` with actual post-it ID:

```bash
curl -X PATCH http://localhost:5000/api/postits/POSTIT_ID/position \
  -H "Content-Type: application/json" \
  -d '{
    "position": {
      "x": 250,
      "y": 100,
      "width": 200,
      "height": 150,
      "zIndex": 2
    }
  }'
```

### 5. Update Post-It Content
```bash
curl -X PUT http://localhost:5000/api/postits/POSTIT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content!",
    "color": "#34D399"
  }'
```

### 6. Bring Post-It to Front
```bash
curl -X POST http://localhost:5000/api/postits/POSTIT_ID/bring-to-front
```

### 7. List All Articles
```bash
curl http://localhost:5000/api/articles
```

### 8. List All Post-Its
```bash
curl http://localhost:5000/api/postits
```

### 9. Bulk Update Positions (for layout changes)
```bash
curl -X POST http://localhost:5000/api/postits/bulk-update-positions \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "id": "POSTIT_ID_1",
        "position": {
          "x": 50,
          "y": 50,
          "width": 200,
          "height": 150,
          "zIndex": 1
        }
      },
      {
        "id": "POSTIT_ID_2",
        "position": {
          "x": 300,
          "y": 80,
          "width": 180,
          "height": 120,
          "zIndex": 2
        }
      }
    ]
  }'
```

## Expected Response Formats

### Article Response:
```json
{
  "_id": "...",
  "title": "My First Board",
  "content": "",
  "summary": "A board for testing post-its",
  "tags": ["test", "board"],
  "createdAt": "2025-11-02T...",
  "updatedAt": "2025-11-02T...",
  "version": 1,
  "isPublished": false
}
```

### Post-It Response:
```json
{
  "_id": "...",
  "content": "This is my first post-it!",
  "articleId": "...",
  "position": {
    "x": 100,
    "y": 150,
    "width": 200,
    "height": 150,
    "zIndex": 1
  },
  "color": "#FBBF24",
  "createdAt": "2025-11-02T...",
  "updatedAt": "2025-11-02T..."
}
```

### Article Post-Its Response:
```json
{
  "articleId": "...",
  "articleTitle": "My First Board",
  "postits": [...],
  "count": 2
}
```