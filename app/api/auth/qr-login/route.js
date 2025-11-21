// app/api/auth/qr-login/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { qrData } = await request.json();
    
    console.log('🔐 QR Login attempt with data:', qrData);

    if (!qrData) {
      return NextResponse.json({ 
        success: false, 
        error: 'QR code data is required' 
      }, { status: 400 });
    }

    // Parse QR data - assuming it contains student_id or a token
    let studentId;
    
    // Check if QR data is a direct student ID
    if (qrData.match(/^\d+$/)) {
      studentId = qrData;
    } else {
      // If it's a token or encoded data, you might need to decode it
      // For now, let's assume QR contains student_id directly
      studentId = qrData;
    }

    // Find student by ID
    const [student] = await query(
      `SELECT 
        id,
        student_id,
        student_name,
        grade,
        section,
        adviser,
        status
      FROM students 
      WHERE student_id = ? OR id = ?`,
      [studentId, studentId]
    );

    if (!student) {
      console.log('❌ Student not found with ID:', studentId);
      return NextResponse.json({ 
        success: false, 
        error: 'Student not found' 
      }, { status: 404 });
    }

    if (student.status !== 'ACTIVE') {
      console.log('❌ Student not active:', studentId);
      return NextResponse.json({ 
        success: false, 
        error: 'Student account is not active' 
      }, { status: 403 });
    }

    // Create JWT token for the student
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const token = await new SignJWT({
      studentId: student.id,
      student_id: student.student_id,
      name: student.student_name,
      grade: student.grade,
      section: student.section,
      type: 'student'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

    console.log('✅ QR Login successful for student:', student.student_name);

    // Record login activity (optional)
    await query(
      'INSERT INTO student_logins (student_id, login_method) VALUES (?, ?)',
      [student.id, 'qr_code']
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        student: {
          id: student.id,
          student_id: student.student_id,
          name: student.student_name,
          grade: student.grade,
          section: student.section,
          adviser: student.adviser
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('❌ QR Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}