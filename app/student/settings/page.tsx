'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  MdVpnKey, MdMail,
  MdNotifications, MdTune, MdLock, MdSearch,
  MdShield, MdCheck, MdInfo
} from 'react-icons/md'

function StudentSettingsContent() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const isFirstLogin = searchParams.get('firstLogin') === 'true' || profile?.mustChangePassword
  const [activeTab, setActiveTab] = useState('security')
  
  // Settings Form States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)
  const [attendanceAlerts, setAttendanceAlerts] = useState(true)
  const [gradeAlerts, setGradeAlerts] = useState(true)
  const [saved, setSaved] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleUpdatePassword = async () => {
    setPasswordMsg(null)
    if (!user || !user.email) {
      setPasswordMsg({ text: 'You must be signed in to update your password.', isError: true })
      return
    }
    if (!currentPassword) {
      setPasswordMsg({ text: 'Please enter your current password.', isError: true })
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', isError: true })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true })
      return
    }

    setUpdatingPassword(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      
      // Clear mustChangePassword in Firestore
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          mustChangePassword: false,
        })
      } catch (docErr) {
        console.warn('Could not update mustChangePassword flag:', docErr)
      }

      setPasswordMsg({ text: 'Password updated successfully!', isError: false })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error('Student password update error:', err)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordMsg({ text: 'Incorrect current password.', isError: true })
      } else {
        setPasswordMsg({ text: err.message || 'Failed to update password.', isError: true })
      }
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="db-header">
        <div className="sl-breadcrumb">
          <span className="sl-brand">EduPortal</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="sl-crumb sl-crumb-active">Settings</span>
        </div>
        <div className="db-search" style={{ maxWidth: 240 }}>
          <MdSearch size={16} color="#9ca3af" />
          <input type="text" placeholder="Search..." />
        </div>
        <TopbarRight defaultRole="Student" />
      </header>

      {/* Content Area */}
      <div className="db-content">
        {/* Page Header */}
        <div className="st-head-row">
          <div>
            <h1 className="sm-title">Settings & Preferences</h1>
            <p className="sm-sub">
              Manage your student account security, notification preferences, and system behavior.
            </p>
          </div>
          <div className="st-action-btns">
            <button className="st-discard-btn">Discard Changes</button>
            <button className="st-save-btn" onClick={handleSave}>
              {saved ? <><MdCheck size={16}/> Saved!</> : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* First-time login banner */}
        {isFirstLogin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#1e40af',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '14px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            fontWeight: 500,
          }}>
            <MdInfo size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
            <div>
              <strong>Action Required:</strong> You have logged in with your temporary password. Please set your new permanent password below.
            </div>
          </div>
        )}

        {/* Settings Layout */}
        <div className="st-layout">
          {/* Left Nav Tabs */}
          <div className="st-nav-card">
            <button 
              className={`st-tab-btn ${activeTab === 'security' ? 'st-tab-active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <MdShield size={18} />
              <span>Account Security</span>
            </button>
            <button 
              className={`st-tab-btn ${activeTab === 'notifications' ? 'st-tab-active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <MdNotifications size={18} />
              <span>Notifications</span>
            </button>
            <button 
              className={`st-tab-btn ${activeTab === 'system' ? 'st-tab-active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              <MdTune size={18} />
              <span>System Preferences</span>
            </button>
            <button 
              className={`st-tab-btn ${activeTab === 'privacy' ? 'st-tab-active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <MdLock size={18} />
              <span>Privacy & Data</span>
            </button>
          </div>

          {/* Right Form Cards */}
          <div className="st-forms-col">
            {/* Password & Authentication */}
            <div className="st-card">
              <div className="st-card-header">
                <div className="st-card-title-row">
                  <MdVpnKey size={18} className="st-icon-purple" />
                  <h2 className="st-card-title">Password & Authentication</h2>
                </div>
                <p className="st-card-desc">
                  Update your password and manage authentication to protect your student portal.
                </p>
              </div>

              <div className="st-form-body">
                {passwordMsg && (
                  <div style={{
                    color: passwordMsg.isError ? '#ef4444' : '#065f46',
                    backgroundColor: passwordMsg.isError ? '#fef2f2' : '#ecfdf5',
                    border: `1px solid ${passwordMsg.isError ? '#fecaca' : '#a7f3d0'}`,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}>
                    {passwordMsg.text}
                  </div>
                )}

                <div className="st-field">
                  <label className="st-label">Current Password</label>
                  <input 
                    type="password" 
                    className="st-input" 
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="st-grid-2">
                  <div className="st-field">
                    <label className="st-label">New Password</label>
                    <input 
                      type="password" 
                      className="st-input" 
                      placeholder="New Password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="st-field">
                    <label className="st-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="st-input" 
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    className="st-secondary-btn"
                    onClick={handleUpdatePassword}
                    disabled={updatingPassword}
                  >
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>

                <div className="st-divider" />

                {/* 2FA Toggle */}
                <div className="st-toggle-row">
                  <div>
                    <h4 className="st-toggle-title">Two-Factor Authentication (2FA)</h4>
                    <p className="st-toggle-desc">
                      Add an extra layer of security to your student account by requiring a verification code upon login.
                    </p>
                  </div>
                  <label className="st-switch">
                    <input 
                      type="checkbox" 
                      checked={twoFactor} 
                      onChange={(e) => setTwoFactor(e.target.checked)} 
                    />
                    <span className="st-slider" />
                  </label>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="st-card">
              <div className="st-card-header">
                <div className="st-card-title-row">
                  <MdMail size={18} className="st-icon-purple" />
                  <h2 className="st-card-title">Communication Preferences</h2>
                </div>
                <p className="st-card-desc">
                  Control how and when EduPortal notifies you about class announcements and attendance.
                </p>
              </div>

              <div className="st-form-body">
                <span className="st-sub-heading">EMAIL NOTIFICATIONS</span>

                <div className="st-toggle-item">
                  <div>
                    <h4 className="st-toggle-title">Attendance & Leave Status Alerts</h4>
                    <p className="st-toggle-desc">Get notified whenever a submitted leave request is approved or rejected.</p>
                  </div>
                  <label className="st-switch">
                    <input 
                      type="checkbox" 
                      checked={attendanceAlerts} 
                      onChange={(e) => setAttendanceAlerts(e.target.checked)} 
                    />
                    <span className="st-slider" />
                  </label>
                </div>

                <div className="st-toggle-item">
                  <div>
                    <h4 className="st-toggle-title">Assignment & Exam Updates</h4>
                    <p className="st-toggle-desc">Daily summaries of upcoming homework deadlines and exams.</p>
                  </div>
                  <label className="st-switch">
                    <input 
                      type="checkbox" 
                      checked={gradeAlerts} 
                      onChange={(e) => setGradeAlerts(e.target.checked)} 
                    />
                    <span className="st-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function StudentSettings() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading settings...</div>}>
      <StudentSettingsContent />
    </Suspense>
  )
}
