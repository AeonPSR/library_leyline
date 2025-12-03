import { NextResponse } from 'next/server';
const PostIt = require('@/lib/models/PostIt');

// POST /api/postits/bulk-update-positions - Bulk update positions
export async function POST(request) {
  try {
    const body = await request.json();
    const { updates } = body;
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const result = await PostIt.bulkUpdatePositions(updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error bulk updating positions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
