'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection,query,where, onSnapshot, addDoc, serverTimestamp,} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import TopbarRight from '@/app/components/TopbarRight'
import {MdSearch, MdUploadFile, MdChevronLeft, MdChevronRight, MdVisibility, MdCheckCircle, MdError } from 'react-icons/md'

interface PreviousLeaveRequest {
  id: string
  dateRange: string
  duration: string
  type: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export default function RequestLeavePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dayType, setDayType] = useState<'single' | 'multi'>('single')
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [previousRequests, setPreviousRequests] = useState<PreviousLeaveRequest[]>([])
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [activePage, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    const q = query(
      collection(db, 'leaveRequests'),
      where('studentId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PreviousLeaveRequest[] = []
      let appCount = 0
      let pendCount = 0

      snapshot.forEach(d => {
        const data = d.data()
        const statusNormalized =
          (data.status?.charAt(0).toUpperCase() + data.status?.slice(1).toLowerCase()) as 'Pending' | 'Approved' | 'Rejected'

        if (data.status?.toLowerCase() === 'approved') appCount++
        if (data.status?.toLowerCase() === 'pending') pendCount++

        const isMulti = data.startDate && data.endDate && data.startDate !== data.endDate
        const dateRangeStr = isMulti ? `${data.startDate} - ${data.endDate}` : data.startDate || 'Single Day'

        list.push({
          id: d.id,
          dateRange: dateRangeStr,
          duration: isMulti ? 'Multiple days' : 'Single day',
          type: data.type || 'Personal Reason',
          reason: data.reason || '',
          status: statusNormalized || 'Pending',
        })
      })

      setApprovedCount(appCount)
      setPendingCount(pendCount)
      setPreviousRequests(list)
    }, (err) => {
      console.error('Error fetching leave requests:', err)
    })

    return () => unsubscribe()
  }, [user, authLoading, router])

  const handleSubmit = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!user) {
      setErrorMsg('You must be signed in to submit a leave request.')
      return
    }
    if (!leaveType) {
      setErrorMsg('Please select a leave type.')
      return
    }
    if (!startDate) {
      setErrorMsg('Please select a start date.')
      return
    }
    if (dayType === 'multi' && !endDate) {
      setErrorMsg('Please select an end date for multi-day leave.')
      return
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for your absence.')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'leaveRequests'), {
        studentId: user.uid,
        studentName: profile?.name || user.displayName || 'Student',
        class: profile?.assignedClass || '',
        type: leaveType === 'sick' ? 'Sick Leave' : leaveType === 'academic' ? 'Academic Activity' : leaveType === 'family' ? 'Family Emergency' : 'Personal Reason',
        startDate,
        endDate: dayType === 'multi' ? endDate : startDate,
        reason: reason.trim(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        createdAt: serverTimestamp(),
      })

      setSuccessMsg('Leave request submitted successfully for teacher review.')
      setLeaveType('')
      setStartDate('')
      setEndDate('')
      setReason('')
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error('Error creating leave request:', err)
      setErrorMsg(error?.message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(previousRequests.length / pageSize) || 1
  const currentPage = Math.min(activePage, totalPages)
  const paginatedRequests = previousRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <>
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
        <TopbarRight defaultRole="Student" />
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
            Remaining Personal Days: <strong>{Math.max(0, 5 - approvedCount)}</strong>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
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
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#065f46',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <MdCheckCircle size={18} color="#10b981" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Two-column layout */}
        <div className="sl-grid">
          {/* Form */}
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
              <button
                className="sl-cancel-btn"
                onClick={() => {
                  setLeaveType('')
                  setStartDate('')
                  setEndDate('')
                  setReason('')
                  setErrorMsg(null)
                  setSuccessMsg(null)
                }}
              >
                Cancel
              </button>
              <button
                className="sl-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '▶ Submit Request'}
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
                  <span className="sl-summary-val sl-green">{approvedCount}</span>
                  <span className="sl-summary-sub">APPROVED<br/>Days total</span>
                </div>
                <div className="sl-summary-divider" />
                <div className="sl-summary-item">
                  <span className="sl-summary-val sl-orange">{pendingCount}</span>
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
              {previousRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    No previous leave requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr key={req.id}>
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
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="sl-pagination">
            <span className="sl-page-info">
              Showing {previousRequests.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, previousRequests.length)} of {previousRequests.length} results
            </span>
            <div className="sl-page-btns">
              <button
                className="sl-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                className="sl-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
