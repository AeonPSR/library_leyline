import { NextResponse } from 'next/server';
const Article = require('@/lib/models/Article');
const PostIt = require('@/lib/models/PostIt');

// GET /api/articles/[id] - Get article by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, summary, tags, isPublished } = body;
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (tags !== undefined) updateData.tags = tags;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const article = await Article.updateById(id, updateData);
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    if (error.message === 'Article not found') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await Article.deleteById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting article:', error);
    if (error.message === 'Article not found') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
