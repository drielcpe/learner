import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const paymentMethods = await query('SELECT * FROM payment_methods WHERE is_active = 1');
    return NextResponse.json({ success: true, data: paymentMethods });
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}