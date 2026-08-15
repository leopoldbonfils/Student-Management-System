'use client'

import React, { useState } from 'react'
import {
  MdDashboard, MdPeople, MdCalendarToday,
  MdSchedule, MdSettings, MdSearch, MdNotifications,
  MdHelp, MdUploadFile, MdChevronLeft, MdChevronRight,
  MdVisibility, MdCheckCircle
} from 'react-icons/md'
import { PiGraduationCapFill } from 'react-icons/pi'

const navItems = [
  { name: 'Dashboard',  Icon: MdDashboard },
  { name: 'Students',   Icon: MdPeople },
  { name: 'Attendance', Icon: MdCalendarToday },
  { name: 'Schedule',   Icon: MdSchedule },
]

const previousRequests = [
  {
    dateRange: 'Oct 24, 2023',
    duration: 'Single day',
    type: 'Personal Reason',
    reason: 'Attending a family wedding out of state...',
    status: 'Pending',
  },
  {
    dateRange: 'Sep 12 - 14, 2023',
    duration: '3 days',
    type: 'Sick Leave',
    reason: "Severe flu. Doctor's note attached in th...",
    status: 'Approved',
  },
  {
    dateRange: 'Aug 28, 2023',
    duration: 'Single day',
    type: 'Academic Activity',
    reason: 'Local hackathon participation during c...',
    status: 'Rejected',
  },
]

export default function RequestLeavePage() {
  const [activeNav, setActiveNav] = useState('Attendance')
  const [dayType, setDayType] = useState<'single' | 'multi'>('single')
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [dragging, setDragging]         = useState(false)

  return (
    <div className="db-wrapper">

      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-logo">
          <div className="db-logo-icon">
            <PiGraduationCapFill size={22} color="white" />
          </div>
          <div>
            <p className="db-logo-title">EduPortal</p>
            <p className="db-logo-sub">MANAGEMENT SYSTEM</p>
          </div>
        </div>

        <nav className="db-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`db-nav-item ${activeNav === item.name ? 'db-nav-active' : ''}`}
              onClick={() => setActiveNav(item.name)}
            >
              <item.Icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <button className="db-nav-item db-settings">
          <MdSettings size={20} />
          <span>Settings</span>
        </button>
      </aside>

      {/* Main */}
      <div className="db-main">

        {/* Header */}
        <header className="db-header">
          <div className="sl-breadcrumb">
            <span className="sl-brand">EduPortal</span>
            <span className="sl-sep">&rsaquo;</span>
            <span className="sl-crumb">Attendance</span>
            <span className="sl-sep">&rsaquo;</span>
            <span className="sl-crumb sl-crumb-active">Ask Leave</span>
          </div>
          <div className="db-search" style={{ maxWidth: 240 }}>
            <MdSearch size={16} color="#9ca3af" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="db-header-actions">
            <button className="db-icon-btn"><MdNotifications size={22} /></button>
            <button className="db-icon-btn"><MdHelp size={22} /></button>
            <div className="db-avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <div className="db-content">

          {/* Page heading */}
          <div className="sl-page-head">
            <div>
              <h1 className="sl-title">Submit Leave Request</h1>
              <p className="sl-sub">Fill out the form below to formally request an absence.</p>
            </div>
            <div className="sl-days-badge">
              <MdCheckCircle size={16} color="#10b981" />
              Remaining Personal Days: <strong>3</strong>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="sl-grid">

            {/* ── Form ── */}
            <div className="sl-form-card">

              {/* Leave Type */}
              <div className="sl-field">
                <label className="sl-label">Leave Type</label>
                <div className="sl-row">
                  <select
                    className="sl-select"
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                  >
                    <option value="">Select reason...</option>
                    <option value="personal">Personal Reason</option>
                    <option value="sick">Sick Leave</option>
                    <option value="academic">Academic Activity</option>
                    <option value="family">Family Emergency</option>
                  </select>

                  <div className="sl-toggle">
                    <button
                      className={`sl-toggle-btn ${dayType === 'single' ? 'sl-toggle-active' : ''}`}
                      onClick={() => setDayType('single')}
                    >
                      Single Day
                    </button>
                    <button
                      className={`sl-toggle-btn ${dayType === 'multi' ? 'sl-toggle-active' : ''}`}
                      onClick={() => setDayType('multi')}
                    >
                      Multi-Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="sl-dates-row">
                <div className="sl-field sl-field-half">
                  <label className="sl-label">Start Date</label>
                  <input
                    type="date"
                    className="sl-input"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                {dayType === 'multi' && (
                  <div className="sl-field sl-field-half">
                    <label className="sl-label">End Date <span className="sl-optional">(Optional)</span></label>
                    <input
                      type="date"
                      className="sl-input"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="sl-field">
                <label className="sl-label">
                  Detailed Reason
                  <span className="sl-char-count">{reason.length}/500</span>
                </label>
                <textarea
                  className="sl-textarea"
                  maxLength={500}
                  placeholder="Please provide specific details regarding your absence request..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div className="sl-field">
                <label className="sl-label">Supporting Documents <span className="sl-optional">(Optional)</span></label>
                <div
                  className={`sl-upload ${dragging ? 'sl-upload-drag' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={() => setDragging(false)}
                >
                  <MdUploadFile size={28} color="#9ca3af" />
                  <p className="sl-upload-text">Click to upload or drag and drop</p>
                  <p className="sl-upload-hint">PDF, JPG or PNG (Max 10MB)</p>
                </div>
              </div>

              {/* Actions */}
              <div className="sl-actions">
                <button className="sl-cancel-btn">Cancel</button>
                <button className="sl-submit-btn">
                  ▶ Submit Request
                </button>
              </div>

            </div>

            {/* Right Panel */}
            <div className="sl-right">

              {/* Leave Policy */}
              <div className="sl-policy-card">
                <div className="sl-policy-head">
                  <span className="sl-policy-icon"></span>
                  <span className="sl-policy-title">Leave Policy</span>
                </div>
                <ul className="sl-policy-list">
                  <li>Requests must be submitted at least <strong>48 hours</strong> in advance for non-emergencies.</li>
                  <li>Medical leaves exceeding 3 days require an uploaded doctor&apos;s note.</li>
                  <li>Unexcused absences may impact final grades according to syllabus policy.</li>
                </ul>
              </div>

              {/* Semester Summary */}
              <div className="sl-summary-card">
                <p className="sl-summary-title">Semester Summary</p>
                <div className="sl-summary-row">
                  <div className="sl-summary-item">
                    <span className="sl-summary-val sl-green">4</span>
                    <span className="sl-summary-sub">APPROVED<br/>Days total</span>
                  </div>
                  <div className="sl-summary-divider" />
                  <div className="sl-summary-item">
                    <span className="sl-summary-val sl-orange">1</span>
                    <span className="sl-summary-sub">PENDING<br/>Request</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Previous Leave Requests */}
          <div className="sl-history-card">
            <div className="sl-history-head">
              <div>
                <h2 className="sl-history-title">Previous Leave Requests</h2>
                <p className="sl-history-sub">History of your submitted absence exemptions.</p>
              </div>
              <button className="sl-filter-btn">▼ Filter</button>
            </div>

            <table className="sl-table">
              <thead>
                <tr>
                  <th>Date Range</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {previousRequests.map((req, i) => (
                  <tr key={i}>
                    <td>
                      <p className="sl-date-main">{req.dateRange}</p>
                      <p className="sl-date-dur">{req.duration}</p>
                    </td>
                    <td>{req.type}</td>
                    <td className="sl-reason-cell">{req.reason}</td>
                    <td>
                      <span className={`sl-badge sl-badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button className="sl-action-btn">
                        <MdVisibility size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="sl-pagination">
              <span className="sl-page-info">Showing 1 to 3 of 5 results</span>
              <div className="sl-page-btns">
                <button className="sl-page-btn"><MdChevronLeft size={18} /></button>
                <button className="sl-page-btn"><MdChevronRight size={18} /></button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
