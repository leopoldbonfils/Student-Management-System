'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight, { getInitials } from '@/app/components/TopbarRight'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  MdEdit, MdSearch,
  MdSchool, MdEmail, MdPerson, MdLocationOn,
  MdCheckCircle, MdClass, MdMap, MdSupervisorAccount,
  MdSave, MdCancel, MdPhone
} from 'react-icons/md'

export default function StudentProfile() {
  const { user, profile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageError, setImageError] = useState(false)

  const studentName = profile?.name || user?.displayName || 'Student'
  const studentEmail = profile?.email || user?.email || ''
  const studentId = profile?.studentId || (user?.uid ? `STD-${user.uid.slice(0, 6).toUpperCase()}` : 'STD-2026')
  const studentClass = profile?.assignedClass || 'React Native'
  const studentPhone = profile?.phone || '+250 788 000 000'
  const studentDob = profile?.dob || 'Not specified'
  const studentGender = profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Student'
  const studentAddress = profile?.address || 'Kigali, Rwanda'
  const initials = getInitials(studentName, studentEmail)
  const avatarUrl = profile?.avatar || user?.photoURL

  const handleStartEdit = () => {
    setPhone(profile?.phone || studentPhone)
    setAddress(profile?.address || studentAddress)
    setEditing(true)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        address,
      })
      setEditing(false)
    } catch (err) {
      console.error('Error updating student profile:', err)
      alert('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="db-header">
        <div className="db-search" style={{ maxWidth: 280 }}>
          <MdSearch size={16} color="#9ca3af" />
          <input type="text" placeholder="Search EduPortal..." />
        </div>
        <TopbarRight defaultRole="Student" />
      </header>

      {/* Content Area */}
      <div className="db-content">
        {/* Breadcrumbs & Title */}
        <div className="pf-breadcrumbs">
          <span>Students</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="pf-crumb-active">Student Profile</span>
        </div>

        <h1 className="pf-page-title">{studentName} Profile</h1>

        {/* Hero Banner Card */}
        <div className="pf-hero-card">
          <div className="pf-hero-left">
            <div className="pf-avatar-wrapper">
              {avatarUrl && !imageError ? (
                <img 
                  src={avatarUrl} 
                  alt={studentName}
                  className="pf-avatar-img"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                  }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="pf-hero-info">
              <h2 className="pf-name">{studentName}</h2>
              <p className="pf-role">
                <MdSchool size={14} className="pf-role-icon" />
                <span>{studentClass}</span>
                <span className="pf-dot">•</span>
                <span>Active Stream</span>
              </p>

              <div className="pf-badge-group">
                <span className="pf-badge-active">
                  <MdCheckCircle size={13} /> Active Student
                </span>
                {studentEmail && (
                  <span className="pf-badge-email">
                    <MdEmail size={13} /> {studentEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!editing ? (
            <button className="pf-edit-btn" onClick={handleStartEdit}>
              <MdEdit size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="pf-edit-btn"
                style={{ background: '#10b981', color: '#fff' }}
                onClick={handleSave}
                disabled={saving}
              >
                <MdSave size={16} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                className="pf-edit-btn"
                style={{ background: '#f3f4f6', color: '#374151' }}
                onClick={() => setEditing(false)}
              >
                <MdCancel size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Lower Grid Details */}
        <div className="pf-grid">
          {/* Left Column */}
          <div className="pf-col">
            {/* Personal Information */}
            <div className="pf-card">
              <div className="pf-card-head">
                <MdPerson size={18} className="pf-head-icon" />
                <h3 className="pf-card-title">Personal Information</h3>
              </div>

              <div className="pf-fields-grid">
                <div className="pf-field">
                  <span className="pf-label">FULL NAME</span>
                  <span className="pf-value">{studentName}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">EMAIL ADDRESS</span>
                  <span className="pf-value pf-link">{studentEmail}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">PHONE NUMBER (RWANDA)</span>
                  {editing ? (
                    <input
                      className="as-input"
                      style={{ marginTop: '4px', fontSize: '13px' }}
                      value={phone}
                      placeholder="+250 788 000 000"
                      onChange={e => setPhone(e.target.value)}
                    />
                  ) : (
                    <span className="pf-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MdPhone size={14} color="#10b981" />
                      {profile?.phone || studentPhone}
                    </span>
                  )}
                </div>
                <div className="pf-field">
                  <span className="pf-label">DATE OF BIRTH</span>
                  <span className="pf-value">{studentDob}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">GENDER</span>
                  <span className="pf-value">{studentGender}</span>
                </div>
              </div>
            </div>

            {/* Contact Address */}
            <div className="pf-card">
              <div className="pf-card-head">
                <MdLocationOn size={18} className="pf-head-icon" />
                <h3 className="pf-card-title">Contact Address</h3>
              </div>

              <div className="pf-address-box">
                <div className="pf-address-icon">
                  <MdMap size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <span className="pf-label">RESIDENTIAL ADDRESS</span>
                  {editing ? (
                    <textarea
                      className="as-textarea"
                      style={{ marginTop: '4px', fontSize: '13px', width: '100%' }}
                      rows={3}
                      placeholder="Kigali, Rwanda"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  ) : (
                    <div className="pf-address-text">
                      <p>{profile?.address || studentAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="pf-col">
            {/* Academic Details */}
            <div className="pf-card">
              <div className="pf-card-head">
                <MdSchool size={18} className="pf-head-icon" />
                <h3 className="pf-card-title">Academic Details</h3>
              </div>

              <div className="pf-fields-grid">
                <div className="pf-field">
                  <span className="pf-label">Student ID</span>
                  <span className="pf-value pf-bold">{studentId}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">Class Assignment</span>
                  <span className="pf-value">{studentClass}</span>
                </div>
                <div className="pf-field pf-full">
                  <span className="pf-label">ACADEMIC SUPERVISION</span>
                  <div className="pf-qual-row">
                    <MdSupervisorAccount size={16} className="pf-qual-icon" />
                    <span className="pf-value">Faculty Department</span>
                  </div>
                </div>
                <div className="pf-field pf-full">
                  <span className="pf-label">STREAM & PROGRAM</span>
                  <span className="pf-value">{studentClass} Technical Stream</span>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="pf-card">
              <div className="pf-card-head pf-space-between">
                <div className="pf-head-left">
                  <MdClass size={18} className="pf-head-icon" />
                  <h3 className="pf-card-title">Active Courses</h3>
                </div>
                <span className="pf-count-badge">4 Courses</span>
              </div>

              <div className="pf-classes-list">
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-blue" />
                  <span>React Native</span>
                </div>
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-green" />
                  <span>Django</span>
                </div>
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-blue" />
                  <span>cybersecurity</span>
                </div>
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-purple" />
                  <span>UI/UX Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
