import { NextResponse } from 'next/server';
const Article = require('@/lib/models/Article');

// POST /api/articles/quick - Quick create article (no form needed)
export async function POST(request) {
  try {
    const articleData = {
      title: '', // Will be set to ID automatically
      content: '',
      summary: 'New post-it board',
      tags: [],
      isPublished: false
    };

    const article = await Article.create(articleData);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating quick article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
