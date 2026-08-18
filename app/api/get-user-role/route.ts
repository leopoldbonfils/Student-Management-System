import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = body?.email || ''
    const uid = body?.uid || ''

    if (!uid && !email) {
      return NextResponse.json({ error: 'UID or email required' }, { status: 400 })
    }

    const cleanEmail = (email || '').trim().toLowerCase()

    // 1. Primary Teacher hard check
    if (cleanEmail === 'leopordbonfils@gmail.com' || cleanEmail.includes('leopord')) {
      const teacherProfile = {
        uid: uid || 'teacher-leopold',
        name: 'MUGISHA Leopold',
        email: cleanEmail,
        role: 'teacher' as const,
        phone: '+250 788 123 456',
        address: 'Kigali, Rwanda',
        assignedClass: 'React Native, Django, Cybersecurity, UI/UX Design',
      }

      if (uid) {
        try {
          await adminDb.collection('users').doc(uid).set(teacherProfile, { merge: true })
        } catch (dbErr) {
          console.warn('AdminDb update skipped:', dbErr)
        }
      }

      return NextResponse.json({
        success: true,
        role: 'teacher',
        profile: teacherProfile,
      })
    }

    // 2. Try Firestore users collection lookup
    try {
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

      if (cleanEmail) {
        const emailQuery = await adminDb
          .collection('users')
          .where('email', '==', cleanEmail)
          .get()

        if (!emailQuery.empty) {
          const matched = emailQuery.docs[0]!
          const data = matched.data()
          const role = data.role || (cleanEmail.includes('teacher') ? 'teacher' : 'student')

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
    } catch (dbErr) {
      console.warn('Firestore lookup error in get-user-role:', dbErr)
    }

    // 3. Clean default fallback based on email
    const defaultRole = cleanEmail.includes('teacher') ? 'teacher' : 'student'
    const defaultName = cleanEmail.includes('teacher') ? 'Faculty Instructor' : (cleanEmail.split('@')[0] || 'Student')
    const defaultProfile = {
      uid: uid || 'user-' + Date.now(),
      email: cleanEmail,
      name: defaultName,
      role: defaultRole,
    }

    return NextResponse.json({
      success: true,
      role: defaultRole,
      profile: defaultProfile,
    })
  } catch (err: any) {
    console.error('Error in get-user-role route:', err)
    return NextResponse.json({
      success: true,
      role: 'student',
      profile: { role: 'student', name: 'User' }
    })
  }
}
