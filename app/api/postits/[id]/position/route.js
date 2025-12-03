import { NextResponse } from 'next/server';
const PostIt = require('@/lib/models/PostIt');

// PATCH /api/postits/[id]/position - Update only position (for dragging)
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { position } = body;
    
    if (!position) {
      return NextResponse.json(
        { error: 'Position data is required' },
        { status: 400 }
      );
    }

    const postIt = await PostIt.updatePosition(params.id, position);
    return NextResponse.json(postIt);
  } catch (error) {
    console.error('Error updating post-it position:', error);
    if (error.message === 'Post-it not found') {
      return NextResponse.json({ error: 'Post-it not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
