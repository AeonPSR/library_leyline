import { NextResponse } from 'next/server';
const Tag = require('@/lib/models/Tag');

// GET /api/tags/[id] - Get tag by ID
export async function GET(request, { params }) {
  try {
    const tag = await Tag.findById(params.id);
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tags/[id] - Update tag
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, description, color } = body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (color) updateData.color = color;

    const tag = await Tag.updateById(params.id, updateData);
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error.message === 'Tag not found') {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    if (error.message === 'Tag name already exists') {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(request, { params }) {
  try {
    const result = await Tag.deleteById(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting tag:', error);
    if (error.message === 'Tag not found') {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
