import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    
    let sql = 'SELECT * FROM sections';
    let params = [];
    
    if (grade && grade !== 'all') {
      sql += ' WHERE grade = ?';
      params.push(grade);
    }
    
    sql += ' ORDER BY grade, section';
    
    const sections = await query(sql, params);
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('Sections fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}