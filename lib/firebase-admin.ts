import 'server-only'
import { getApps, initializeApp, cert, getApp, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore'

function getAdminApp(): App {
  const apps = getApps()
  if (apps.length > 0) {
    return apps[0]!
  }

  const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS

  if (credentialsJson) {
    try {
      const parsed = typeof credentialsJson === 'string' ? JSON.parse(credentialsJson) : credentialsJson
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    } catch (err) {
      console.error('Failed to parse FIREBASE_ADMIN_CREDENTIALS:', err)
    }
  }

  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  })
}

export const adminApp = getAdminApp()
export const adminAuth: Auth = getAuth(adminApp)
export const adminDb: Firestore = getFirestore(adminApp)
export { FieldValue }
