'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  MdEdit, MdSearch,
  MdWork, MdEmail, MdPerson, MdLocationOn,
  MdCheckCircle, MdSchool, MdClass, MdMap, MdSave, MdCancel
} from 'react-icons/md'

export default function TeacherProfile() {
  const { user, profile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  const teacherName = profile?.name || user?.displayName || 'Faculty Member'
  const teacherEmail = profile?.email || user?.email || 'teacher@eduportal.edu'
  const teacherPhone = profile?.phone || '+1 (555) 123-4567'
  const teacherAddress = profile?.address || '482 Academic Way, University District, Seattle, WA 98105'

  const handleStartEdit = () => {
    setPhone(teacherPhone)
    setAddress(teacherAddress)
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
      console.error('Error updating profile:', err)
      alert('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Top Header */}
      <header className="td-topbar">
        <div className="sm-header-search" style={{ width: 320 }}>
          <MdSearch size={16} color="#9ca3af" />
          <input placeholder="Search EduPortal..." />
        </div>
      </header>

      {/* Content Area */}
      <div className="td-content">
        {/* Breadcrumbs & Title */}
        <div className="pf-breadcrumbs">
          <span>Faculty</span>
          <span className="sl-sep">&rsaquo;</span>
          <span className="pf-crumb-active">Teacher Profile</span>
        </div>

        <h1 className="pf-page-title">{teacherName} Profile</h1>

        {/* Hero Banner Card */}
        <div className="pf-hero-card">
          <div className="pf-hero-left">
            <div className="pf-avatar-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop" 
                alt={teacherName}
                className="pf-avatar-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>

            <div className="pf-hero-info">
              <h2 className="pf-name">{teacherName}</h2>
              <p className="pf-role">
                <MdWork size={14} className="pf-role-icon" />
                <span>Senior Faculty</span>
                <span className="pf-dot">•</span>
                <span>Science & Math Dept.</span>
              </p>

              <div className="pf-badge-group">
                <span className="pf-badge-active">
                  <MdCheckCircle size={13} /> Active Staff
                </span>
                <span className="pf-badge-email">
                  <MdEmail size={13} /> {teacherEmail}
                </span>
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
                  <span className="pf-value">{teacherName}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">EMAIL ADDRESS</span>
                  <span className="pf-value pf-link">{teacherEmail}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">PHONE NUMBER</span>
                  {editing ? (
                    <input
                      className="as-input"
                      style={{ marginTop: '4px', fontSize: '13px' }}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  ) : (
                    <span className="pf-value">{teacherPhone}</span>
                  )}
                </div>
                <div className="pf-field">
                  <span className="pf-label">DATE OF BIRTH</span>
                  <span className="pf-value">October 14, 1982</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">GENDER</span>
                  <span className="pf-value">{profile?.gender || 'Faculty'}</span>
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
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  ) : (
                    <div className="pf-address-text">
                      <p>{teacherAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="pf-col">
            {/* Professional Details */}
            <div className="pf-card">
              <div className="pf-card-head">
                <MdWork size={18} className="pf-head-icon" />
                <h3 className="pf-card-title">Professional Details</h3>
              </div>

              <div className="pf-fields-grid">
                <div className="pf-field">
                  <span className="pf-label">Employee ID</span>
                  <span className="pf-value pf-bold">EMP-{user?.uid?.slice(0, 6).toUpperCase() || '2018-042'}</span>
                </div>
                <div className="pf-field">
                  <span className="pf-label">Status</span>
                  <span className="pf-value">Active Faculty</span>
                </div>
                <div className="pf-field pf-full">
                  <span className="pf-label">HIGHEST QUALIFICATION</span>
                  <div className="pf-qual-row">
                    <MdSchool size={16} className="pf-qual-icon" />
                    <span className="pf-value">Ph.D. in Education / Applied Sciences</span>
                  </div>
                </div>
                <div className="pf-field pf-full">
                  <span className="pf-label">SPECIALIZATION</span>
                  <span className="pf-value">Mathematics, General Curriculum</span>
                </div>
              </div>
            </div>

            {/* Assigned Classes */}
            <div className="pf-card">
              <div className="pf-card-head pf-space-between">
                <div className="pf-head-left">
                  <MdClass size={18} className="pf-head-icon" />
                  <h3 className="pf-card-title">Assigned Classes</h3>
                </div>
                <span className="pf-count-badge">4 Total</span>
              </div>

              <div className="pf-classes-list">
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-blue" />
                  <span>Grade 10 - Mathematics</span>
                </div>
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-green" />
                  <span>Grade 9 - Science</span>
                </div>
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-blue" />
                  <span>Grade 11 - English</span>
                </div>
                <div className="pf-class-pill">
                  <span className="pf-dot pf-dot-purple" />
                  <span>General Class</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
