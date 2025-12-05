import { NextResponse } from 'next/server';
const Article = require('@/lib/models/Article');
const PostIt = require('@/lib/models/PostIt');

// GET /api/articles/[id]/postits - Get all post-its for an article
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    // First check if article exists
    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const postits = await PostIt.findByArticleId(id);
    const count = await PostIt.getCountByArticleId(id);
    
    return NextResponse.json({
      articleId: id,
      articleTitle: article.title,
      postits,
      count
    });
  } catch (error) {
    console.error('Error fetching post-its for article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
