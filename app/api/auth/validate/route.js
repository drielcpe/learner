import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const role = searchParams.get('role')

    console.log('🔐 Session validation request:', { studentId, role })

    if (role === 'student' && studentId) {
      // Validate student session
      const students = await query(
        `SELECT id, student_id, student_name, grade, section, status 
         FROM students 
         WHERE student_id = ? AND status = 'ACTIVE'`,
        [studentId]
      )

      if (students.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Student not found or inactive',
            valid: false 
          },
          { status: 401 }
        )
      }

      const student = students[0]
      return NextResponse.json({
        success: true,
        valid: true,
        data: {
          studentId: student.student_id,
          studentName: student.student_name,
          grade: student.grade,
          section: student.section,
          role: 'student'
        }
      })

    } else if (role === 'admin') {
      // For admin, we'd validate against admin table
      // For now, just return valid if role is admin
      return NextResponse.json({
        success: true,
        valid: true,
        data: { role: 'admin' }
      })

    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid session data',
          valid: false 
        },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('❌ Session validation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Session validation failed',
        valid: false 
      },
      { status: 500 }
    )
  }
}