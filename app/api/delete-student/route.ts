import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json()

    if (!uid) {
      return NextResponse.json({ error: 'Student UID is required.' }, { status: 400 })
    }

    // 1. Delete from Firestore users collection
    await adminDb.collection('users').doc(uid).delete()

    // 2. Delete from Firebase Authentication
    try {
      await adminAuth.deleteUser(uid)
    } catch (authErr: any) {
      console.warn('Auth user delete warning (may already be removed):', authErr.message)
    }

    // 3. Clean up associated attendance records
    try {
      const attSnap = await adminDb.collection('attendance').where('studentId', '==', uid).get()
      const batch = adminDb.batch()
      attSnap.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
    } catch (attErr) {
      console.warn('Attendance cleanup warning:', attErr)
    }

    // 4. Clean up associated leave requests
    try {
      const leaveSnap = await adminDb.collection('leaveRequests').where('studentId', '==', uid).get()
      const batch = adminDb.batch()
      leaveSnap.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
    } catch (leaveErr) {
      console.warn('Leave request cleanup warning:', leaveErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Student and related records deleted successfully.',
    })
  } catch (err: any) {
    console.error('Error deleting student:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete student.' },
      { status: 500 }
    )
  }
}
