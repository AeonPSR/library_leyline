import { NextResponse } from 'next/server';
const Article = require('@/lib/models/Article');
const PostIt = require('@/lib/models/PostIt');

// GET /api/articles - Get all articles with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      tags: tags ? tags.split(',') : undefined,
      search: search || undefined
    };

    const result = await Article.findAll(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/articles - Create new article
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, summary, tags, isPublished } = body;
    
    // Content is optional now since we use post-its
    const articleData = {
      title: title ? title.trim() : '', // Will be set to ID if empty
      content: content ? content.trim() : '',
      summary: summary ? summary.trim() : '',
      tags: tags || [],
      isPublished: isPublished || false
    };

    const article = await Article.create(articleData);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
