import { NextResponse } from 'next/server';
const PostIt = require('@/lib/models/PostIt');

// GET /api/postits - Get all post-its with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const articleId = searchParams.get('articleId');
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      articleId: articleId || undefined
    };

    const result = await PostIt.findAll(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching post-its:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/postits - Create new post-it
export async function POST(request) {
  try {
    const body = await request.json();
    const { content, articleId, position, color } = body;
    
    // Basic validation
    if (!content || !articleId) {
      return NextResponse.json(
        { error: 'Content and articleId are required' },
        { status: 400 }
      );
    }

    const postItData = {
      content: content.trim(),
      articleId,
      position: position || {},
      color: color || '#FBBF24'
    };

    const postIt = await PostIt.create(postItData);
    return NextResponse.json(postIt, { status: 201 });
  } catch (error) {
    console.error('Error creating post-it:', error);
    if (error.message === 'Article not found') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
