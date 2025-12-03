import { NextResponse } from 'next/server';
const Tag = require('@/lib/models/Tag');

// GET /api/tags - Get all tags
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const withCount = searchParams.get('withCount');
    
    if (withCount === 'true') {
      const tags = await Tag.getTagsWithArticleCount();
      return NextResponse.json(tags);
    }
    
    const options = {
      search: search || undefined,
      sortBy: sortBy || 'name'
    };

    const tags = await Tag.findAll(options);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tags - Create new tag
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, color } = body;
    
    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const tagData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#3B82F6'
    };

    const tag = await Tag.create(tagData);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error.message === 'Tag already exists') {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
