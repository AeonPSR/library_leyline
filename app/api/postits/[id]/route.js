import { NextResponse } from 'next/server';
const PostIt = require('@/lib/models/PostIt');

// GET /api/postits/[id] - Get post-it by ID
export async function GET(request, { params }) {
  try {
    const postIt = await PostIt.findById(params.id);
    
    if (!postIt) {
      return NextResponse.json({ error: 'Post-it not found' }, { status: 404 });
    }
    
    return NextResponse.json(postIt);
  } catch (error) {
    console.error('Error fetching post-it:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/postits/[id] - Update post-it
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { content, position, color } = body;
    
    const updateData = {};
    if (content) updateData.content = content.trim();
    if (position) updateData.position = position;
    if (color) updateData.color = color;

    const postIt = await PostIt.updateById(params.id, updateData);
    return NextResponse.json(postIt);
  } catch (error) {
    console.error('Error updating post-it:', error);
    if (error.message === 'Post-it not found') {
      return NextResponse.json({ error: 'Post-it not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/postits/[id] - Delete post-it
export async function DELETE(request, { params }) {
  try {
    const result = await PostIt.deleteById(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting post-it:', error);
    if (error.message === 'Post-it not found') {
      return NextResponse.json({ error: 'Post-it not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
