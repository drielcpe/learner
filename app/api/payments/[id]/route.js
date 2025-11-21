import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    // Await the params in App Router
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    console.log('🔧 Debug - Request details:', {
      id,
      body,
      status
    });

    // Validate required fields
    if (!status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Status is required' 
      }, { status: 400 });
    }

    // Ensure id is a number
    const paymentId = parseInt(id);
    if (isNaN(paymentId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid payment ID' 
      }, { status: 400 });
    }

    console.log('🔧 Debug - Final parameters:', [status, paymentId]);

    // Simple update query
    const sql = 'UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?';
    const result = await query(sql, [status, paymentId]);
    
    console.log('✅ Update successful - Affected rows:', result.affectedRows);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Payment status updated to ${status}`,
      affectedRows: result.affectedRows 
    });
  } catch (error) {
    console.error('❌ Payment update error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      sqlMessage: error.sqlMessage
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    console.log('🔧 GET - Payment ID:', id);
    
    const payment = await query(
      `SELECT p.*, s.student_name, s.student_id as student_code, pm.method_name 
       FROM payments p 
       LEFT JOIN students s ON p.student_id = s.id 
       LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id 
       WHERE p.id = ?`,
      [parseInt(id)]
    );
    
    if (payment.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: payment[0] 
    });
  } catch (error) {
    console.error('GET payment error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}