'use client'

import React, { useState, useRef } from 'react'
import {
  MdSearch, MdCameraAlt, MdSave
} from 'react-icons/md'

export default function AddStudent() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
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
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhoto(url)
    }
  }

  const handleSave = () => {
    setSaved(true)
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
                  placeholder="e.g. Jane Doe"
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
                placeholder="e.g. STU 2024 001"
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
                <option value="grade10a">Grade 10 - A</option>
                <option value="grade10b">Grade 10 - B</option>
                <option value="grade9a">Grade 9 - A</option>
                <option value="grade9b">Grade 9 - B</option>
                <option value="grade11sci">Grade 11 - Science</option>
                <option value="grade11arts">Grade 11 - Arts</option>
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
                placeholder="+1 (555) 000 0000"
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
          <button className="sl-cancel-btn">Cancel</button>
          <button
            className={`as-save-btn ${saved ? 'as-saved' : ''}`}
            onClick={handleSave}
          >
            <MdSave size={16} />
            {saved ? 'Student Saved!' : 'Save Student'}
          </button>
        </div>
      </div>
    </>
  )
}
