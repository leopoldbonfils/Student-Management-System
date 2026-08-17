'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, query, collection, where, getDocs, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

const LoginPage = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const user = userCredential.user

      // Get role securely from server API
      let userRole = 'student'
      try {
        const roleRes = await fetch('/api/get-user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, uid: user.uid }),
        })
        const roleData = await roleRes.json()
        if (roleData.success && roleData.role) {
          userRole = roleData.role
        }
      } catch (roleErr) {
        console.warn('Role check warning:', roleErr)
      }

      if (userRole === 'teacher') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password. Please try again.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Title */}
        <h1 className="title">EduPortal</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && (
          <div style={{
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <MdEmail className="icon" size={20} />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <MdLock className="icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="form-options">
            <label className="remember">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="btn-signin" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

        </form>

        {/* Footer */}
        <p className="footer-text">
          Don&apos;t have an account? <a href="#">Request access</a>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
