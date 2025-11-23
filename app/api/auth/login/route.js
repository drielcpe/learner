import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request) {
  try {
    // Check if request body is valid JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password, role, studentId, qrCode } = body;

    console.log('🔐 Login attempt:', { email, role, studentId });

    // Validate required fields based on login type
    if (role === 'admin') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required for admin login' },
          { status: 400 }
        );
      }
    } else if (role === 'student') {
      // For QR code login
      if (qrCode) {
        // Handle QR code login logic here
        // You'll need to decode the QR code and extract student ID
      } else if (!studentId) {
        return NextResponse.json(
          { success: false, error: 'Student ID or QR code is required for student login' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Admin login
    if (role === 'admin') {
      try {
        // Query admin from database
        const admins = await query(
          'SELECT * FROM admins WHERE email = ? AND is_active = TRUE',
          [email]
        );

        if (admins.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid admin credentials' },
            { status: 401 }
          );
        }

        const admin = admins[0];

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if (!isPasswordValid) {
          return NextResponse.json(
            { success: false, error: 'Invalid admin credentials' },
            { status: 401 }
          );
        }

        // Create session data
        const sessionData = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin',
          permissions: admin.permissions ? JSON.parse(admin.permissions) : []
        };

        console.log('✅ Admin login successful:', admin.email);

        // Update last login time
        await query(
          'UPDATE admins SET last_login = NOW() WHERE id = ?',
          [admin.id]
        );

        return NextResponse.json({
          success: true,
          data: sessionData,
          message: 'Login successful'
        });

      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return NextResponse.json(
          { success: false, error: 'Database error during login' },
          { status: 500 }
        );
      }
    }

    // Student login (for direct student ID login)
    if (role === 'student' && studentId) {
      try {
        // Query student from database
        const students = await query(
          'SELECT * FROM students WHERE student_id = ? AND status = "ACTIVE"',
          [studentId]
        );

        if (students.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Student not found or inactive' },
            { status: 401 }
          );
        }

        const student = students[0];

        // Create session data
        const sessionData = {
          id: student.id,
          student_id: student.student_id,
          student_name: student.student_name,
          email: student.email,
          grade: student.grade,
          section: student.section,
          adviser: student.adviser,
          role: 'student',
          student_type: student.student_type
        };

        console.log('✅ Student login successful:', student.student_name);

        return NextResponse.json({
          success: true,
          data: sessionData,
          message: 'Login successful'
        });

      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return NextResponse.json(
          { success: false, error: 'Database error during student login' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid login method' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}