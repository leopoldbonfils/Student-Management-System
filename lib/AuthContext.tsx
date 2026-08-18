'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, query, collection, where, getDocs, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: 'student' | 'teacher'
  studentId?: string
  assignedClass?: string
  phone?: string
  address?: string
  gender?: string
  dob?: string
  avatar?: string
  mustChangePassword?: boolean
  createdAt?: any
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  role: 'student' | 'teacher' | null
  loading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile
        setProfile({ ...data, uid })
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // First sync via Admin API to guarantee real teacher/student identity and avoid permission-denied crashes
        if (currentUser.email) {
          fetch('/api/get-user-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, uid: currentUser.uid }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.profile) {
                setProfile({ ...data.profile, uid: currentUser.uid })
              }
              setLoading(false)
            })
            .catch((err) => {
              console.warn('API role fetch error:', err)
            })
        }

        // Real-time listener for user profile updates
        const docRef = doc(db, 'users', currentUser.uid)
        try {
          unsubscribeDoc = onSnapshot(
            docRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data() as UserProfile
                setProfile({ ...data, uid: currentUser.uid })
              }
              setLoading(false)
            },
            (error) => {
              // Silently handle Firestore permission-denied by trusting the admin API profile
              if (error.code !== 'permission-denied') {
                console.warn('Profile listener info:', error.message)
              }
              setLoading(false)
            }
          )
        } catch (e) {
          setLoading(false)
        }
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc()
          unsubscribeDoc = null
        }
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeDoc) {
        unsubscribeDoc()
      }
    }
  }, [])

  const logout = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        loading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
