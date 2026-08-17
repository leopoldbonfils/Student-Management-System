import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb, FieldValue } from '@/lib/firebase-admin'
import { sendStudentCredentials } from '@/lib/email'
import crypto from 'crypto'

function generateTemporaryPassword(length = 10): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
  let password = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i]! % chars.length]
  }
  return password
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName,
      email,
      studentId,
      assignedClass,
      phone,
      gender,
      dob,
      address,
    } = body

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required.' },
        { status: 400 }
      )
    }

    // 1. Generate temporary password
    const tempPassword = generateTemporaryPassword(10)

    // 2. Create user in Firebase Authentication
    let userRecord
    try {
      userRecord = await adminAuth.createUser({
        email: email.trim().toLowerCase(),
        password: tempPassword,
        displayName: fullName.trim(),
      })
    } catch (authError: any) {
      console.error('Firebase Auth user creation error:', authError)
      if (authError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'A student with this email address already exists.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: authError.message || 'Failed to create student authentication account.' },
        { status: 500 }
      )
    }

    // 3. Create student profile in Firestore
    try {
      await adminDb.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: 'student',
        studentId: studentId?.trim() || '',
        assignedClass: assignedClass?.trim() || '',
        phone: phone?.trim() || '',
        gender: gender || '',
        dob: dob || '',
        address: address?.trim() || '',
        mustChangePassword: true,
        createdAt: FieldValue.serverTimestamp(),
      })
    } catch (dbError: any) {
      console.error('Firestore user profile creation error:', dbError)
      // Cleanup auth account if profile write fails
      await adminAuth.deleteUser(userRecord.uid).catch(() => {})
      return NextResponse.json(
        { error: 'Failed to create student profile in database.' },
        { status: 500 }
      )
    }

    // 4. Send credentials email via Resend
    let emailResult = { success: true }
    try {
      const result = await sendStudentCredentials({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: tempPassword,
      })
      if (!result.success && result.error) {
        console.warn('Credential email warning:', result.error)
      }
    } catch (emailErr) {
      console.error('Error dispatching credential email:', emailErr)
      // Non-fatal: student is still created
    }

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: 'Student account created and credentials email dispatched.',
    })
  } catch (error: any) {
    console.error('Unexpected error in create-student route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
