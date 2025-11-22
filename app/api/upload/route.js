import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('qrCode');
    const methodId = formData.get('methodId');

    if (!file || !methodId) {
      return NextResponse.json(
        { success: false, error: 'File and method ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Update database with file data using the NEW column names
    await query(
      `UPDATE payment_methods 
       SET qr_code_data = ?, qr_code_filename = ?, qr_code_mimetype = ?, has_qr = TRUE 
       WHERE id = ?`,
      [buffer, file.name, file.type, methodId]
    );

    console.log('✅ QR code uploaded for method:', methodId);

    return NextResponse.json({
      success: true,
      message: 'QR code uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}