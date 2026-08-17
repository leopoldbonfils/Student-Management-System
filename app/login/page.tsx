'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdVpnKey,
  MdCheckCircle,
  MdError
} from 'react-icons/md'

const LoginPage = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // First Login Reset Password Modal States
  const [showResetModal, setShowResetModal] = useState(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
      const user = userCredential.user

      // Get role & first-login status securely from server API
      let userRole = 'student'
      let mustChange = false
      try {
        const roleRes = await fetch('/api/get-user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, uid: user.uid }),
        })
        const roleData = await roleRes.json()
        if (roleData.success && roleData.role) {
          userRole = roleData.role
          mustChange = !!roleData.profile?.mustChangePassword
        }
      } catch (roleErr) {
        console.warn('Role check warning:', roleErr)
      }

      if (userRole === 'teacher') {
        router.push('/teacher/dashboard')
      } else if (mustChange) {
        // Detect temporary/initial password -> Trigger Reset Password Modal
        setAuthenticatedUser(user)
        setOldPassword(cleanPassword) // Auto-fill old password from current login session
        setShowResetModal(true)
      } else {
        router.push('/student/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('Invalid email or password. Please verify your credentials and try again.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Password Reset Submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    const cleanOld = oldPassword.trim()
    const cleanNew = newPassword.trim()
    const cleanConfirm = confirmPassword.trim()

    if (!authenticatedUser || !authenticatedUser.email) {
      setResetError('Authentication session not found. Please log in again.')
      return
    }

    if (!cleanOld) {
      setResetError('Please enter your current temporary password.')
      return
    }

    if (!cleanNew || cleanNew.length < 6) {
      setResetError('New password must be at least 6 characters long.')
      return
    }

    if (cleanNew === cleanOld) {
      setResetError('New password must be different from your temporary password.')
      return
    }

    if (cleanNew !== cleanConfirm) {
      setResetError('New passwords do not match.')
      return
    }

    setResetLoading(true)

    try {
      // 1. Reauthenticate with old/temporary password
      const credential = EmailAuthProvider.credential(authenticatedUser.email, cleanOld)
      await reauthenticateWithCredential(authenticatedUser, credential)

      // 2. Update password in Firebase Authentication
      await updatePassword(authenticatedUser, cleanNew)

      // 3. Update Firestore to remove mustChangePassword requirement
      try {
        await updateDoc(doc(db, 'users', authenticatedUser.uid), {
          mustChangePassword: false,
        })
      } catch {
        // Fallback to server API if needed
        await fetch('/api/update-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: authenticatedUser.uid,
            mustChangePassword: false,
          }),
        }).catch(() => {})
      }

      setResetSuccess(true)

      // 4. Redirect student to dashboard
      setTimeout(() => {
        router.push('/student/dashboard')
      }, 1000)
    } catch (err: any) {
      console.error('Password reset error:', err)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setResetError('Incorrect current/temporary password.')
      } else if (err.code === 'auth/weak-password') {
        setResetError('The new password is too weak. Please use letters, numbers, or symbols.')
      } else {
        setResetError(err.message || 'Failed to update password. Please try again.')
      }
    } finally {
      setResetLoading(false)
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

      {/* Reset Password Modal for First-Time Login */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            padding: '28px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <MdVpnKey size={24} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                Reset Temporary Password
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                As this is your first time logging in, please create a new permanent password before continuing to your student dashboard.
              </p>
            </div>

            {resetError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#b91c1c',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                <MdError size={18} style={{ flexShrink: 0 }} />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#047857',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                <MdCheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>Password updated successfully! Redirecting to dashboard...</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Old Password (Auto-filled) */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Old / Temporary Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#f9fafb',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showOldPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showNewPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={resetLoading || resetSuccess}
                style={{
                  marginTop: '8px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: resetLoading || resetSuccess ? 'not-allowed' : 'pointer',
                  opacity: resetLoading || resetSuccess ? 0.75 : 1,
                  transition: 'background-color 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {resetLoading ? 'Saving New Password...' : 'Save Password & Enter Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
