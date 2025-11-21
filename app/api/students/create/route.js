// app/api/students/create/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📦 Create student request body:', body);
    
    const requiredFields = ['student_id', 'student_name', 'grade', 'section'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Check for duplicate student_id
    const existingStudents = await query(
      'SELECT id FROM students WHERE student_id = ?',
      [body.student_id]
    );
    
    if (existingStudents.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Student ID already exists' 
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO students (
        student_id, student_name, grade, section, adviser, 
        contact_number, email, address, birth_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.student_id,
        body.student_name,
        body.grade,
        body.section,
        body.adviser || null,
        body.contact_number || null,
        body.email || null,
        body.address || null,
        body.birth_date || null,
        body.status || 'ACTIVE'
      ]
    );

    const [newStudent] = await query(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    const formatDate = (date) => {
      if (!date) return null;
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return null;
    };

    const formattedStudent = {
      ...newStudent,
      id: newStudent.id.toString(),
      contact_number: newStudent.contact_number || "",
      email: newStudent.email || "",
      address: newStudent.address || "",
      birth_date: formatDate(newStudent.birth_date),
      enrollment_date: formatDate(newStudent.created_at),
    };

    return NextResponse.json({ 
      success: true, 
      data: formattedStudent,
      message: 'Student created successfully'
    });
    
  } catch (error) {
    console.error('❌ Student creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}