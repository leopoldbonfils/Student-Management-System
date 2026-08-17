import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const {
      uid,
      name,
      studentId,
      assignedClass,
      phone,
      gender,
      dob,
      address,
      status,
    } = await req.json()

    if (!uid) {
      return NextResponse.json({ error: 'Student UID is required.' }, { status: 400 })
    }

    const updatePayload: Record<string, any> = {}
    if (name !== undefined) updatePayload.name = name.trim()
    if (studentId !== undefined) updatePayload.studentId = studentId.trim()
    if (assignedClass !== undefined) updatePayload.assignedClass = assignedClass.trim()
    if (phone !== undefined) updatePayload.phone = phone.trim()
    if (gender !== undefined) updatePayload.gender = gender
    if (dob !== undefined) updatePayload.dob = dob
    if (address !== undefined) updatePayload.address = address.trim()
    if (status !== undefined) updatePayload.status = status

    // 1. Update in Firestore
    await adminDb.collection('users').doc(uid).update(updatePayload)

    // 2. Update Firebase Auth displayName if name changed
    if (name) {
      try {
        await adminAuth.updateUser(uid, { displayName: name.trim() })
      } catch (authErr) {
        console.warn('Auth updateUser warning:', authErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully.',
    })
  } catch (err: any) {
    console.error('Error updating student:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update student.' },
      { status: 500 }
    )
  }
}
