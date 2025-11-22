import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT qr_code_data, qr_code_mimetype, qr_code_filename 
       FROM payment_methods 
       WHERE id = ? AND qr_code_data IS NOT NULL`,
      [id]
    );

    if (result.length === 0) {
      // Return a placeholder image or empty response instead of 404
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    const { qr_code_data, qr_code_mimetype } = result[0];

    return new NextResponse(qr_code_data, {
      status: 200,
      headers: {
        'Content-Type': qr_code_mimetype,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('❌ QR code fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}