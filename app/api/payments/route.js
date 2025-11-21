import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const grade = searchParams.get('grade');
    const section = searchParams.get('section');
    
    let sql = `
      SELECT 
        p.*,
        s.student_id as student_code,
        s.student_name,
        s.grade,
        s.section,
        s.adviser,
        pm.method_name,
        pm.method_code
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
    `;
    
    let params = [];
    let conditions = [];
    
    if (studentId) {
      conditions.push('p.student_id = ?');
      params.push(studentId);
    }
    
    if (status && status !== 'all') {
      conditions.push('p.status = ?');
      params.push(status);
    }
    
    if (grade && grade !== 'all') {
      conditions.push('s.grade = ?');
      params.push(grade);
    }
    
    if (section && section !== 'all') {
      conditions.push('s.section = ?');
      params.push(section);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const payments = await query(sql, params);
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { student_ids, amount, description, desc, payment_method_id, due_date } = body;
    
    // Handle multiple student payments
    const results = [];
    
    for (const studentId of student_ids) {
      const result = await query(
        `INSERT INTO payments (student_id, payment_method_id, amount, description, \`desc\`, due_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [studentId, payment_method_id, amount, description, desc || null, due_date]
      );
      results.push({ studentId, paymentId: result.insertId });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${student_ids.length} payment(s) created successfully`,
      data: results 
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}