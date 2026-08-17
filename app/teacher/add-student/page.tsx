'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {
  MdSearch, MdCameraAlt, MdSave, MdCheckCircle, MdError
} from 'react-icons/md'

export default function AddStudent() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    fullName: '',
    gender: '',
    dob: '',
    studentId: '',
    assignedClass: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleChange = (field: string, value: string) => {
    setSaved(false)
    setErrorMessage(null)
    setSuccessMessage(null)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhoto(url)
    }
  }

  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; tempPassword?: string } | null>(null)

  const handleSave = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setCreatedCredentials(null)

    if (!form.fullName.trim()) {
      setErrorMessage('Please enter the student\'s full name.')
      return
    }
    if (!form.email.trim()) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register student.')
      }

      setSaved(true)
      if (data.tempPassword) {
        setCreatedCredentials({ email: form.email.trim(), tempPassword: data.tempPassword })
      }
      setSuccessMessage('Student created successfully! Login credentials have been dispatched to their email.')
      // Reset form
      setForm({
        fullName: '',
        gender: '',
        dob: '',
        studentId: '',
        assignedClass: '',
        email: '',
        phone: '',
        address: '',
      })
      setPhoto(null)
    } catch (err: any) {
      console.error('Error saving student:', err)
      setErrorMessage(err.message || 'An error occurred while creating the student.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="td-topbar">
        <span className="td-header-brand">EduPortal</span>
        <div className="sm-header-search">
          <MdSearch size={16} color="#9ca3af" />
          <input placeholder="Search..." />
        </div>

        <TopbarRight defaultRole="Teacher" />
      </header>

      {/* Content */}
      <div className="td-content">
        {/* Page heading */}
        <div style={{ marginBottom: 20 }}>
          <h1 className="sm-title">Add Student</h1>
          <p className="as-sub">
            Enter the details below to <span>register a new student</span> in the system.
          </p>
        </div>

        {/* Notifications / Alerts */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <MdError size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            color: '#065f46',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '16px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <MdCheckCircle size={20} color="#10b981" />
              <span>{successMessage}</span>
            </div>
            {createdCredentials && (
              <div style={{
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
                marginTop: '4px',
                padding: '10px 14px',
                background: '#ffffff',
                border: '1px solid #d1fae5',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#1f2937'
              }}>
                <div><strong>Login Email:</strong> <span style={{ fontFamily: 'monospace', color: '#047857' }}>{createdCredentials.email}</span></div>
                <div><strong>Temporary Password:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>{createdCredentials.tempPassword}</span></div>
              </div>
            )}
          </div>
        )}

        {/* Top row: Photo + Personal Info */}
        <div className="as-top-row">
          {/* Photo upload */}
          <div className="as-photo-card">
            <div
              className="as-photo-box"
              onClick={() => fileRef.current?.click()}
            >
              {photo ? (
                <img src={photo} alt="Student" className="as-photo-img" />
              ) : (
                <MdCameraAlt size={32} color="#9ca3af" />
              )}
            </div>
            <p className="as-photo-label">Upload Photo</p>
            <p className="as-photo-hint">Allowed formats: JPG, PNG. Max size: 2MB.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhoto}
            />
          </div>

          {/* Personal Information */}
          <div className="as-card">
            <h2 className="as-section-title">Personal Information</h2>

            <div className="as-fields-row">
              <div className="as-field">
                <label className="as-label">Full Name</label>
                <input
                  className="as-input"
                  placeholder="e.g. mugisha leopold"
                  value={form.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                />
              </div>
              <div className="as-field">
                <label className="as-label">Gender</label>
                <select
                  className="as-select"
                  value={form.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="as-field">
              <label className="as-label">Date of Birth</label>
              <input
                type="date"
                className="as-input"
                value={form.dob}
                onChange={e => handleChange('dob', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom row: Academic + Contact */}
        <div className="as-bottom-row">
          {/* Academic Info */}
          <div className="as-card">
            <h2 className="as-section-title">Academic Info</h2>

            <div className="as-field">
              <label className="as-label">Student ID</label>
              <input
                className="as-input"
                placeholder="e.g. STD 2026"
                value={form.studentId}
                onChange={e => handleChange('studentId', e.target.value)}
              />
            </div>

            <div className="as-field">
              <label className="as-label">Assigned Class</label>
              <select
                className="as-select"
                value={form.assignedClass}
                onChange={e => handleChange('assignedClass', e.target.value)}
              >
                <option value="">Select Class</option>
                <option value="React Native">React Native</option>
                <option value="Django">Django</option>
                <option value="cybersecurity">cybersecurity</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="as-card">
            <h2 className="as-section-title">Contact Info</h2>

            <div className="as-field">
              <label className="as-label">Email Address</label>
              <input
                type="email"
                className="as-input"
                placeholder="student@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>

            <div className="as-field">
              <label className="as-label">Phone Number</label>
              <input
                type="tel"
                className="as-input"
                placeholder="0780000000"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="as-field">
              <label className="as-label">Home Address</label>
              <textarea
                className="as-textarea"
                placeholder="Enter full address..."
                rows={2}
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="as-footer">
          <button
            className="sl-cancel-btn"
            onClick={() => {
              setForm({
                fullName: '',
                gender: '',
                dob: '',
                studentId: '',
                assignedClass: '',
                email: '',
                phone: '',
                address: '',
              })
              setPhoto(null)
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
          >
            Cancel
          </button>
          <button
            className={`as-save-btn ${saved ? 'as-saved' : ''}`}
            onClick={handleSave}
            disabled={loading}
          >
            <MdSave size={16} />
            {loading ? 'Registering...' : saved ? 'Student Saved!' : 'Save Student'}
          </button>
        </div>
      </div>
    </>
  )
}
