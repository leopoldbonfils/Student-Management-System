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
        // Real-time listener for user profile so updates (e.g. phone/address/photo) reflect immediately
        const docRef = doc(db, 'users', currentUser.uid)
        unsubscribeDoc = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile
              setProfile({ ...data, uid: currentUser.uid })
            } else if (currentUser.email) {
              fetch('/api/get-user-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, uid: currentUser.uid }),
              })
                .then(r => r.json())
                .then(data => {
                  if (data.profile) {
                    setProfile({ ...data.profile, uid: currentUser.uid })
                  } else {
                    setProfile(null)
                  }
                })
                .catch(() => setProfile(null))
            } else {
              setProfile(null)
            }
            setLoading(false)
          },
          (error) => {
            console.error('Error listening to user profile:', error)
            setLoading(false)
          }
        )
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
