'use client'

import React, { useState } from 'react'
import {
  MdVpnKey, MdMail,
  MdNotifications, MdTune, MdLock, MdSearch,
  MdShield, MdCheck
} from 'react-icons/md'

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState('security')
  
  // Settings Form States
  const [currentPassword, setCurrentPassword] = useState('••••••••')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)
  const [attendanceAlerts, setAttendanceAlerts] = useState(true)
  const [gradeAlerts, setGradeAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
                <div className="st-field">
                  <label className="st-label">Current Password</label>
                  <input 
                    type="password" 
                    className="st-input" 
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
                      placeholder="New Password"
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
                  <button className="st-secondary-btn">Update Password</button>
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
