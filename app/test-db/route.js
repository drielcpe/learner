import { testConnection, query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json(connectionTest, { status: 500 });
    }

    // Test a simple query
    const result = await query('SELECT * FROM attendance');
    return NextResponse.json({
      success: true,
      message: 'Database connection and query test successful',
      connectionTest,
      queryResult: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error.message,
    }, { status: 500 });
  }
}