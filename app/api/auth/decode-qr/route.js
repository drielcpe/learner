import { NextResponse } from 'next/server'

// We'll use a dynamic import to avoid build issues
let QrScanner;

async function decodeQRCode(imageBuffer) {
  try {
    // Dynamically import the QR scanner
    if (!QrScanner) {
      QrScanner = (await import('qr-scanner')).default;
    }

    console.log('🔍 Starting QR code decoding...');
    
    // Create a blob from the buffer
    const blob = new Blob([imageBuffer]);
    
    // Use QrScanner to decode the QR code
    const result = await QrScanner.scanImage(blob, {
      returnDetailedScanResult: true
    });

    console.log('✅ QR code decoded successfully:', result.data);
    return result.data;
    
  } catch (error) {
    console.error('❌ QR decoding failed:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const qrCodeFile = formData.get('qrCode');

    if (!qrCodeFile) {
      return NextResponse.json(
        { success: false, error: 'QR code file is required' },
        { status: 400 }
      );
    }

    console.log('📷 QR code received for decoding:', {
      name: qrCodeFile.name,
      type: qrCodeFile.type,
      size: qrCodeFile.size
    });

    // Convert file to buffer
    const arrayBuffer = await qrCodeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Decode the actual QR code
    const qrContent = await decodeQRCode(buffer);

    if (!qrContent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not decode QR code from image'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        qrContent: qrContent,
        decoded: true
      }
    });

  } catch (error) {
    console.error('❌ QR decoding API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'QR decoding failed: ' + error.message
      },
      { status: 500 }
    );
  }
}