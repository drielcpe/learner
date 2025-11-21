// app/api/debug-students/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const students = await query('SELECT id, student_id, student_name FROM students ORDER BY id');
    
    return NextResponse.json({
      success: true,
      data: students,
      total: students.length
    });
    
  } catch (error) {
    console.error('Debug students error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}