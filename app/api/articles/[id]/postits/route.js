import { NextResponse } from 'next/server';
const Article = require('@/lib/models/Article');
const PostIt = require('@/lib/models/PostIt');

// GET /api/articles/[id]/postits - Get all post-its for an article
export async function GET(request, { params }) {
  try {
    // First check if article exists
    const article = await Article.findById(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const postits = await PostIt.findByArticleId(params.id);
    const count = await PostIt.getCountByArticleId(params.id);
    
    return NextResponse.json({
      articleId: params.id,
      articleTitle: article.title,
      postits,
      count
    });
  } catch (error) {
    console.error('Error fetching post-its for article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
