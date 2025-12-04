import { getDB } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    const db = getDB();
    const result = db.prepare('SELECT 1 as health').get();
    
    if (!result || result.health !== 1) {
      throw new Error('Database health check failed');
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'library-website',
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'library-website',
      error: error.message
    }, { status: 503 });
  }
}
