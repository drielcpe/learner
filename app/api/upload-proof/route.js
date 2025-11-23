import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('proofOfPayment')
    const paymentId = formData.get('paymentId')
    const studentId = formData.get('studentId')
    const methodId = formData.get('methodId')
    const amount = formData.get('amount')
    const description = formData.get('description')

    console.log('📤 Upload proof request:', { 
      paymentId, 
      studentId, 
      methodId,
      amount,
      description,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })

    if (!file || !studentId || !methodId) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file, studentId, and methodId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB.' },
        { status: 400 }
      )
    }

    // First, verify the student exists
    console.log('🔍 Verifying student exists...')
    const studentCheck = await query(
      `SELECT student_id, student_name, grade, section FROM students WHERE student_id = ?`,
      [studentId]
    )

    console.log('🔍 Student check result:', studentCheck)

    if (studentCheck.length === 0) {
      console.log('❌ Student not found')
      return NextResponse.json(
        { success: false, error: `Student ${studentId} not found in database` },
        { status: 404 }
      )
    }

    const student = studentCheck[0]
    let actualPaymentId = paymentId ? parseInt(paymentId) : null

    // Check if payment exists if paymentId was provided
    if (actualPaymentId) {
      const paymentCheck = await query(
        `SELECT id, student_id, status FROM payments WHERE id = ? AND student_id = ?`,
        [actualPaymentId, studentId]
      )

      console.log('🔍 Payment check result:', paymentCheck)

      if (paymentCheck.length === 0) {
        console.log('❌ Payment not found, will create new payment')
        actualPaymentId = null
      } else {
        console.log('✅ Payment found:', paymentCheck[0])
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'proofs')
    try {
      await fs.access(uploadsDir)
      console.log('📁 Uploads directory exists:', uploadsDir)
    } catch {
      console.log('📁 Creating uploads directory:', uploadsDir)
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename using timestamp and random number
    const fileExtension = path.extname(file.name)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const fileName = `proof_${studentId}_${timestamp}_${random}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    console.log('💾 Saving file to:', filePath)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filePath, buffer)
    console.log('✅ File saved successfully')

    // If no payment exists, create one
    if (!actualPaymentId) {
      console.log('💰 Creating new payment record...')
      
      // Use provided amount or default to 0
      const paymentAmount = amount ? parseFloat(amount) : 0
      const paymentDescription = description || 'Payment with proof upload'
      
      const createResult = await query(
        `INSERT INTO payments (student_id, student_name, amount, status, payment_method_id, description, reference_file, created_at, updated_at)
         VALUES (?, ?, ?, 'review', ?, ?, ?, NOW(), NOW())`,
        [
          studentId, 
          student.student_name, 
          paymentAmount, 
          parseInt(methodId),
          paymentDescription,
          `/uploads/proofs/${fileName}`
        ]
      )

      actualPaymentId = createResult.insertId
      console.log('✅ Created new payment with ID:', actualPaymentId)
      
      return NextResponse.json({
        success: true,
        message: 'Proof of payment uploaded and payment created successfully',
        filePath: `/uploads/proofs/${fileName}`,
        paymentId: actualPaymentId,
        action: 'created',
        data: {
          id: actualPaymentId,
          student_id: studentId,
          student_name: student.student_name,
          amount: paymentAmount,
          description: paymentDescription,
          status: 'review',
          payment_method_id: parseInt(methodId),
          reference_file: `/uploads/proofs/${fileName}`
        }
      })
    } else {
      // Update existing payment record
      console.log('📊 Updating existing payment record...')
      const updateResult = await query(
        `UPDATE payments 
         SET reference_file = ?, status = 'review', updated_at = NOW() 
         WHERE id = ? AND student_id = ?`,
        [`/uploads/proofs/${fileName}`, actualPaymentId, studentId]
      )

      console.log('📊 Database update result - Affected rows:', updateResult.affectedRows)

      if (updateResult.affectedRows === 0) {
        // Clean up the uploaded file if update fails
        console.log('❌ Database update failed, cleaning up file')
        await fs.unlink(filePath).catch(console.error)
        return NextResponse.json(
          { success: false, error: 'Failed to update payment record. No rows affected.' },
          { status: 500 }
        )
      }

      console.log('✅ Proof of payment uploaded successfully')
      return NextResponse.json({
        success: true,
        message: 'Proof of payment uploaded successfully',
        filePath: `/uploads/proofs/${fileName}`,
        paymentId: actualPaymentId,
        action: 'updated'
      })
    }

  } catch (error) {
    console.error('❌ Upload proof error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}