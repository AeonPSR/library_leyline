import { NextResponse } from 'next/server';
const PostIt = require('@/lib/models/PostIt');

// POST /api/postits/[id]/bring-to-front - Bring post-it to front
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const postIt = await PostIt.bringToFront(id);
    return NextResponse.json(postIt);
  } catch (error) {
    console.error('Error bringing post-it to front:', error);
    if (error.message === 'Post-it not found') {
      return NextResponse.json({ error: 'Post-it not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
