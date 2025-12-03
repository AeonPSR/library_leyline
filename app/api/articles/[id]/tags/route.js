import { NextResponse } from 'next/server';
const Article = require('@/lib/models/Article');

// POST /api/articles/[id]/tags - Add tags to article
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { tags } = body;
    
    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags must be provided as an array' },
        { status: 400 }
      );
    }

    const article = await Article.addTags(params.id, tags);
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error adding tags to article:', error);
    if (error.message === 'Article not found') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/articles/[id]/tags - Remove tags from article
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { tags } = body;
    
    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags must be provided as an array' },
        { status: 400 }
      );
    }

    const article = await Article.removeTags(params.id, tags);
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error removing tags from article:', error);
    if (error.message === 'Article not found') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
