import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Fetching payments...');
    
    const payments = await query(`
      SELECT p.*, s.student_name, s.status, pm.method_name as payment_method_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE s.status != 'INACTIVE'
      ORDER BY p.created_at DESC
    `);
    
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
        data.description || data.desc || '',
        data.payment_method_id,
        data.due_date || null,
        'pending' // default status
      ]);

      results.push({
        id: result.insertId,
        student_id: studentId,
        amount: data.amount,
        description: data.description || data.desc || '',
        payment_method_id: data.payment_method_id,
        due_date: data.due_date,
        status: 'pending'
      });
    }

    console.log('✅ Payments created:', results.length);
    
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