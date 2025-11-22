// app/api/payment-methods/[id]/qr/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Await the params Promise
    const { id } = await params;
    
    console.log('🔍 QR code request for method ID:', id);

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method ID' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT qr_code_data, qr_code_mimetype, qr_code_filename, has_qr
       FROM payment_methods 
       WHERE id = ?`,
      [parseInt(id)]
    );

    console.log('📊 Database query result - Records found:', result.length);

    if (result.length === 0) {
      console.log('❌ No payment method found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    const method = result[0];
    console.log('📋 Method details:', {
      id: id,
      has_qr: method.has_qr,
      has_data: !!method.qr_code_data,
      data_length: method.qr_code_data?.length,
      filename: method.qr_code_filename,
      mimetype: method.qr_code_mimetype
    });

    if (!method.has_qr || !method.qr_code_data) {
      console.log('❌ QR code data missing');
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Convert the buffer to a proper format
    let qrCodeBuffer;
    if (Buffer.isBuffer(method.qr_code_data)) {
      qrCodeBuffer = method.qr_code_data;
    } else if (method.qr_code_data instanceof Uint8Array) {
      qrCodeBuffer = Buffer.from(method.qr_code_data);
    } else if (typeof method.qr_code_data === 'string') {
      qrCodeBuffer = Buffer.from(method.qr_code_data, 'base64');
    } else {
      // If it's a MySQL BLOB, it might be stored as an array
      qrCodeBuffer = Buffer.from(method.qr_code_data);
    }

    console.log('✅ Returning QR code, buffer size:', qrCodeBuffer.length);

    return new NextResponse(qrCodeBuffer, {
      status: 200,
      headers: {
        'Content-Type': method.qr_code_mimetype || 'image/png',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000',
        'Content-Length': qrCodeBuffer.length.toString(),
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