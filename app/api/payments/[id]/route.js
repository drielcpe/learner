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
        s.status,
        pm.method_name,
        pm.method_code
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE s.status != 'INACTIVE'
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
      sql += ' AND ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    console.log('🔍 Executing payments query:', sql);
    console.log('📊 With parameters:', params);
    
    const payments = await query(sql, params);
    
    console.log('✅ Found payments:', payments.length);
    
    return NextResponse.json({ 
      success: true, 
      data: payments 
    });
  } catch (error) {
    console.error('❌ Payments fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('💰 Creating new payment:', data);
    
    // Validate required fields
    if (!data.student_ids || !data.amount || !data.payment_method_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Student IDs, amount, and payment method are required' 
      }, { status: 400 });
    }

    const results = [];
    
    // Create a payment for each student
    for (const studentId of data.student_ids) {
      const result = await query(`
        INSERT INTO payments 
        (student_id, amount, description, payment_method_id, due_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        data.amount,
        data.description || data.desc || 'Payment',
        data.payment_method_id,
        data.due_date || null,
        'pending'
      ]);

      // Get the newly created payment with joined data
      const newPayment = await query(`
        SELECT 
          p.*, 
          s.student_name,
          s.grade,
          s.section,
          s.adviser,
          pm.method_name,
          pm.method_code,
          s.status,
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.id
        LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
         WHERE s.status != 'INACTIVE'
        WHERE p.id = ?
      `, [result.insertId]);

      console.log('✅ New payment created:', newPayment[0]);

      results.push(newPayment[0] || {
        id: result.insertId,
        student_id: studentId,
        amount: data.amount,
        description: data.description || data.desc || 'Payment',
        payment_method_id: data.payment_method_id,
        due_date: data.due_date,
        status: 'pending',
        method_name: 'Unknown', // Fallback
        method_code: 'unknown'  // Fallback
      });
    }

    console.log('✅ Payments created:', results);
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      message: `Created ${results.length} payment(s) successfully`
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}