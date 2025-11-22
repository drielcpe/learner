import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment method ID is required' 
      }, { status: 400 });
    }

    // Check if this payment method is used in transactions table
    const usage = await query(
      'SELECT COUNT(*) as usageCount FROM transactions WHERE payment_method_id = ?',
      [id]
    );

    const isUsed = usage[0].usageCount > 0;

    return NextResponse.json({ 
      success: true, 
      data: {
        isUsed,
        usageCount: usage[0].usageCount
      }
    });
    
  } catch (error) {
    console.error('❌ Check payment method usage error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}