import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email, uid, desiredName, desiredRole } = await req.json()

    if (!email && !uid) {
      return NextResponse.json({ error: 'Email or UID required' }, { status: 400 })
    }

    const cleanEmail = (email || '').trim().toLowerCase()

    // 1. If this is leopordbonfils@gmail.com, ensure teacher identity MUGISHA Leopold
    if (cleanEmail === 'leopordbonfils@gmail.com' || cleanEmail.includes('leopord')) {
      const teacherName = desiredName || 'MUGISHA Leopold'
      const teacherRole = 'teacher'

      // Check if another student doc had this email
      const allWithEmail = await adminDb.collection('users').where('email', '==', cleanEmail).get()
      for (const docSnap of allWithEmail.docs) {
        if (docSnap.id !== uid) {
          const docData = docSnap.data()
          if (docData.name === 'Francine Umutoni' || docData.role === 'student') {
            // Give Francine her own email so it doesn't collide
            await docSnap.ref.update({
              email: 'francine.umutoni@eduportal.rw',
            })
          }
        }
      }

      // Ensure the teacher's document under UID is correct
      if (uid) {
        await adminDb.collection('users').doc(uid).set({
          uid,
          name: teacherName,
          email: cleanEmail,
          role: teacherRole,
          phone: '+250 788 123 456',
          address: 'Kigali, Rwanda',
          assignedClass: 'React Native, Django, Cybersecurity, UI/UX Design',
          updatedAt: new Date().toISOString(),
        }, { merge: true })
      }

      return NextResponse.json({
        success: true,
        message: `Teacher profile updated for ${teacherName}`,
        profile: {
          uid,
          name: teacherName,
          email: cleanEmail,
          role: teacherRole,
        },
      })
    }

    // Generic update
    if (uid) {
      const updates: any = {}
      if (desiredName) updates.name = desiredName
      if (desiredRole) updates.role = desiredRole
      if (cleanEmail) updates.email = cleanEmail

      await adminDb.collection('users').doc(uid).set(updates, { merge: true })
      return NextResponse.json({ success: true, message: 'Profile updated' })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error in sync-user-profile:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
