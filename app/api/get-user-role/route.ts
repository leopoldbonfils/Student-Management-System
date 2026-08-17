import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email, uid } = await req.json()

    if (!uid && !email) {
      return NextResponse.json({ error: 'UID or email required' }, { status: 400 })
    }

    // 1. Check if users/{uid} document exists
    if (uid) {
      const docRef = adminDb.collection('users').doc(uid)
      const docSnap = await docRef.get()

      if (docSnap.exists) {
        const data = docSnap.data()
        return NextResponse.json({
          success: true,
          role: data?.role || 'student',
          profile: { ...data, uid },
        })
      }
    }

    // 2. Fallback: Search by email in users collection
    if (email) {
      const emailQuery = await adminDb
        .collection('users')
        .where('email', '==', email.trim().toLowerCase())
        .get()

      if (!emailQuery.empty) {
        const matched = emailQuery.docs[0]!
        const data = matched.data()
        const role = data.role || 'teacher'

        // Upsert directly under the real UID using admin privileges
        if (uid) {
          await adminDb.collection('users').doc(uid).set(
            {
              ...data,
              uid,
              role,
            },
            { merge: true }
          )
        }

        return NextResponse.json({
          success: true,
          role,
          profile: { ...data, uid: uid || matched.id, role },
        })
      }
    }

    // 3. If not found at all, create a default profile
    const defaultRole = email?.includes('teacher') ? 'teacher' : 'teacher'
    if (uid && email) {
      await adminDb.collection('users').doc(uid).set({
        uid,
        email: email.trim().toLowerCase(),
        name: email.split('@')[0] || 'User',
        role: defaultRole,
      }, { merge: true })
    }

    return NextResponse.json({
      success: true,
      role: defaultRole,
      profile: { uid, email, role: defaultRole },
    })
  } catch (err: any) {
    console.error('Error in get-user-role route:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
